### send-notification

Beispielaufruf:

```bash
curl -X POST 'http://localhost:54321/functions/v1/send-notification' \
  -H 'Content-Type: application/json' \
  -d '{"event_type":"NEW_APPLICATION","recipient_id":"<UUID>","data":{"job_title":"Gartenhilfe","applicant_name":"Max"}}'
```
