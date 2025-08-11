import React from "react";
import { Button, Alert } from "react-native";
import { Linking } from "react-native";

export default function UpgradeButton({ user }: { user: { id: string; email: string; token: string } }) {
  const onPress = async () => {
    try {
      const res = await fetch("https://api.mutuus-app.de/premium/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      const { url } = await res.json();
      if (url) Linking.openURL(url);
    } catch (e) {
      Alert.alert("Fehler", "Checkout konnte nicht gestartet werden.");
    }
  };

  return (
    <Button title="Upgrade auf Premium (14,99 €/Monat)" onPress={onPress} />
  );
}

