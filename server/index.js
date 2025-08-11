import express from "express";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import Stripe from "stripe";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(helmet());
app.use(cors({ origin: ["https://mutuus-app.de", "http://localhost:3000"] }));

// Raw body ONLY for the webhook route:
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/stripe/webhook")) {
    bodyParser.raw({ type: "application/json" })(req, res, next);
  } else {
    bodyParser.json()(req, res, next);
  }
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

/** Helpers: DB */
async function getUserById(userId) {
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, stripe_customer_id, is_premium, premium_tier, premium_current_period_end"
    )
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

async function upsertStripeCustomerId(userId, stripeCustomerId) {
  const { error } = await supabase
    .from("users")
    .update({ stripe_customer_id: stripeCustomerId })
    .eq("id", userId);
  if (error) throw error;
}

async function setPremium(userId, { isPremium, tier, periodEnd }) {
  const { error } = await supabase
    .from("users")
    .update({
      is_premium: isPremium,
      premium_tier: tier,
      premium_current_period_end: periodEnd,
    })
    .eq("id", userId);
  if (error) throw error;
}

async function logPayment(row) {
  const { error } = await supabase.from("payments").insert({ ...row, raw: row.raw });
  if (error) throw error;
}

/** 3.1 Create Checkout Session (Subscription) */
app.post("/premium/checkout", async (req, res) => {
  try {
    const {
      userId,
      email,
      successPath = "/premium/success",
      cancelPath = "/premium",
    } = req.body;
    const user = await getUserById(userId);
    let customerId = user?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      });
      customerId = customer.id;
      await upsertStripeCustomerId(userId, customerId);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      allow_promotion_codes: true,
      line_items: [{ price: "price_XXXXXXXXXXXX", quantity: 1 }],
      success_url: `${process.env.APP_BASE_URL}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_BASE_URL}${cancelPath}`,
      subscription_data: {
        metadata: { userId, tier: "premium_v1" },
      },
      payment_method_types: ["card", "sepa_debit"],
      locale: "de",
      client_reference_id: userId,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "checkout_session_error" });
  }
});

/** 3.2 Customer Portal Link */
app.post("/premium/portal", async (req, res) => {
  try {
    const { userId, returnPath = "/account" } = req.body;
    const user = await getUserById(userId);
    if (!user?.stripe_customer_id)
      return res.status(400).json({ error: "no_customer" });

    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.APP_BASE_URL}${returnPath}`,
    });
    res.json({ url: portal.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "portal_error" });
  }
});

/** 3.3 Query Premium Status */
app.get("/premium/status", async (req, res) => {
  const userId = req.query.userId;
  const user = await getUserById(userId);
  res.json({
    is_premium: !!user?.is_premium,
    premium_tier: user?.premium_tier,
    premium_until: user?.premium_current_period_end,
  });
});

/** 3.4 Webhook */
app.post("/stripe/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerId = session.customer;
        const subId = session.subscription;
        const sub = await stripe.subscriptions.retrieve(subId);
        const userId =
          session.client_reference_id || sub.metadata?.userId;
        await setPremium(userId, {
          isPremium: true,
          tier: "premium_v1",
          periodEnd: new Date(sub.current_period_end * 1000).toISOString(),
        });
        await logPayment({
          user_id: userId,
          type: "webhook",
          stripe_event: event.type,
          stripe_customer_id: customerId,
          stripe_subscription_id: subId,
          raw: event,
        });
        break;
      }
      case "invoice.payment_succeeded": {
        const inv = event.data.object;
        const sub = await stripe.subscriptions.retrieve(inv.subscription);
        const userId = sub.metadata?.userId;
        await setPremium(userId, {
          isPremium: true,
          tier: sub.metadata?.tier || "premium_v1",
          periodEnd: new Date(sub.current_period_end * 1000).toISOString(),
        });
        await logPayment({
          user_id: userId,
          type: "webhook",
          stripe_event: event.type,
          stripe_customer_id: inv.customer,
          stripe_subscription_id: inv.subscription,
          raw: event,
        });
        break;
      }
      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        const data = event.data.object;
        let sub, customerId, subId, userId;
        if (event.type === "customer.subscription.deleted") {
          sub = data;
          subId = sub.id;
          customerId = sub.customer;
          userId = sub.metadata?.userId;
        } else {
          subId = data.subscription;
          customerId = data.customer;
          sub = await stripe.subscriptions.retrieve(subId);
          userId = sub.metadata?.userId;
        }
        await setPremium(userId, {
          isPremium: false,
          tier: null,
          periodEnd: null,
        });
        await logPayment({
          user_id: userId,
          type: "webhook",
          stripe_event: event.type,
          stripe_customer_id: customerId,
          stripe_subscription_id: subId,
          raw: event,
        });
        break;
      }
      default:
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Webhook error handler", err);
    res.status(500).send("webhook_handler_error");
  }
});

app.listen(process.env.PORT || 8080, () =>
  console.log("Server listening on", process.env.PORT || 8080)
);

