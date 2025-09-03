## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Run in docker

```bash
# build image
$ yarn docker:build

# default mode
$ yarn docker:up

# dev mode
$ yarn docker:up:d
```

# API Technical Specification

## Goal

The API classifies each incoming HTTP(S) request as **`human`** or **`bot`** without relying on behavioral metadata (mouse gestures, clicks, etc.).

## Core Idea

The classification is based on **comparative analysis**. For each request, the system builds a “profile” using network and protocol attributes. This profile is then compared against known human baselines and bot signatures. Requests that deviate strongly from human norms or match known automation patterns are flagged as bots.

---

## Input / Output

### Input

- IP
- TLS/JA3 fingerprint
- HTTP headers (presence, order, values)

### Output

- **`category`** -> `human | bot`
- **`score`** -> float ∈ [0,1] (confidence)
- **`reasons`** -> list of triggered rules or anomalies

---

## API Endpoints

### `POST /classify`

Classifies a single request profile.

**Request body (JSON):**

```json
{
  "ip": "203.0.113.10",
  "headers": { "User-Agent": "Mozilla/5.0 ..." },
  "tlsFingerprint": "771,4866-4867-4865-49196,...",
  "asn": 15169,
  "geo": "US",
  "networkType": "hosting"
}
```

**Response (JSON):**

```json
{
  "category": "bot",
  "score": 0.91,
  "reasons": ["Hosting ASN", "Suspicious TLS fingerprint"]
}
```

### `GET /health`

Returns basic API health check (used for monitoring).

---

## Classification Levels

### L0 - Black/White Lists

- **Blocked IP / country** -> reject immediately.
- **Whitelisted IP** -> accept immediately.
- **Unknown IP** -> continue checks.

### L1 - HTTP Header Consistency

- Bots often use **outdated, missing, or inconsistent headers**.
- Cross-check header presence, order, and values.
- Suspicious = unusual order / missing standard headers -> score increase
- Normal = matches real browsers -> score decrease

### L2 - Network Type & ASN

- ASN shows network ownership (e.g., **AWS, Google Cloud, Hetzner**).
- Suspicious = data center ASN -> score increase
- Normal = ISP or mobile provider -> score decrease

### L2 - Reputation & VPN/Proxy/Tor

- Check IP against **reputation databases**.
- Suspicious = IP known for abuse, Tor, VPN, proxy -> score increase
- Normal = no issues -> score decrease

### L3 - TLS/JA3 Fingerprint

- TLS handshake patterns reveal specific **libraries** (cURL, Python, Selenium).
- Suspicious = known automation fingerprints -> score increase
- Normal = typical browser fingerprints -> score decrease

### L5 - Request Rate & Timing Patterns

- Track number of requests per IP/ASN over time.
- Suspicious = dozens of requests per second -> automation.
- Normal = human-like rhythm -> no change or score decrease

### L6 - Combined Scoring / ML

- Final score = aggregation of signals above.
- Suspicious = multiple signals align -> classify as bot.
- Normal = majority consistent with human traffic -> classify as human.

---

## Data Storage

### MongoDB (long-term storage, auditing, analytics)

- **collections:**
  - `requests` -> each request profile with decision + score.
    - indexed by `ip`, `asn`, `timestamp`.
  - `fingerprints` -> known TLS/JA3 fingerprints with labels.
  - `blacklists` -> blacklist rules (IPs, ASNs, geo).
  - `whitelists` -> whitelist rules (IPs, ASNs, geo).
- MongoDB is used for **persistence** and later **analytics** (bot trends, reporting).

### Redis (short-term, high-performance checks)

- **cache:** IP reputation lookups, ASN-to-network-type mapping.
- **rate limiting:** track request frequency per IP/ASN in real-time.
- **session cache:** recent classification decisions (avoid recomputing for same IP within short window).

This hybrid approach keeps the system **fast (Redis)** and **auditable (MongoDB)**.

---

# Classification Levels Coefs

| Level | Criteria              | Coef. (0–1) | Description                                                                      |
| ----- | --------------------- | ----------- | -------------------------------------------------------------------------------- |
| L0    | Black/White list      | 1.0         | If IP/ASN is on the blacklist -> immediately bot; whitelist -> immediately human |
| L1    | Http headers          | 0.3         | Missing/strange titles -> +0.3 to the score                                      |
| L2    | Network type / ASN    | 0.25        | Hosting/Cloud ASN -> +0.25; ISP/Mobile -> -0.25                                  |
| L3    | VPN/Proxy/Tor         | 0.25        | Proxy/Tor usage -> +0.25                                                         |
| L4    | TLS/JA3 fingerprint   | 0.35        | Known ‘non-human’ fingerprints (curl, python) -> +0.35                           |
| L5    | Requests frequency    | 0.25        | >100 req/min from a single IP -> +0.25                                           |
| L6    | Combined Scoring / ML | 0.2–0.4     | Model trained on all signals; result adds weight                                 |

**Summary scoring:**

- <0.4 -> **human**
- 0.4–0.7 -> **requires additional check** (we can either proceed to the next classification level or mark as human with respective suggestions)
- \>0.7 -> **bot**

If score remains in the 0.4–0.7 zone after all checks - return **human**

---

# Bot Detection API — MVP Specification

## Scope

The MVP focuses on a lightweight classification system to determine whether an incoming request is from a **human** or a **bot**.  
It includes:

- **L0–L3 Classification Levels**
- **Black/White list management** (stored in MongoDB)

## Design Note

To keep the MVP independent of external 3rd-party IP intelligence services, **network context attributes** (network type, VPN/Proxy/Tor status) are provided in the request payload.
This way, the API only performs classification logic, not data enrichment.

---

## Input

The classification endpoint receives:

- **IP** — request origin address
- **HTTP Headers** — checked for presence, order, and specific values (e.g., `User-Agent`, `Accept-Language`)
- **Network Type** — `residential`, `mobile`, `hosting`
- **VPN** — boolean flag, provided externally
- **Proxy** — boolean flag, provided externally
- **Tor** — boolean flag, provided externally

---

## Classification Levels (MVP)

- **L0 — Black/White List**
  - Immediate allow/deny based on IP in MongoDB lists.
- **L1 — HTTP Header Consistency**
  - Validate presence, order, and values of headers (especially `User-Agent` and `Accept-Language`).
- **L2 — Network Context**
  - Check ASN and network type. Hosting/data center => suspicious; residential/mobile => less suspicious.
- **L3 — Anonymity Signals**
  - Evaluate VPN, Proxy, and Tor flags. If any is true => higher risk score.

---

## Output

- **category**: `human | bot`
- **score**: float ∈ [0,1]
- **reasons**: list of triggered rules

For simplicity, rules signaling for human behaviour are not provided in the response.

---

# Requests example

### Example 1: Regular browser user

**Input:**

```json
{
  "ip": "91.201.45.33",
  "headers": {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
  },
  "networkType": "residential"
}
```

**Expected:**

```json
{
  "category": "human",
  "score": 0.35,
  "reasons": ["L1: missing Accept-Language"]
}
```

---

### Example 2: Python-script from AWS server

**Input:**

```json
{
  "ip": "3.120.45.77",
  "headers": {
    "User-Agent": "python-requests/2.28.1",
    "Accept-Language": "uk-UA"
  },
  "networkType": "hosting"
}
```

**Expected:**

```json
{
  "category": "bot",
  "score": 0.7,
  "reasons": [
    "L1: bot-like User-Agent (python-requests)",
    "L2: hosting network type"
  ]
}
```

---

### Example 3: User from a mobile VPN

**Input:**

```json
{
  "ip": "185.200.45.12",
  "headers": {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
    "Accept-Language": "uk-UA"
  },
  "vpn": true
}
```

**Expected:**

```json
{
  "category": "human",
  "score": 0.3,
  "reasons": ["L3: VPN/Proxy detected"]
}
```

## Possible Next Steps for MVP Improvement

1. **Expand Classification Layers**
   - Add TLS/JA3 fingerprint checks to detect non-browser clients
   - Introduce request rate analysis (per IP / ASN / Geo)

2. **Response Normalization**
   - Use a standardized risk score format
   - Provide more granular classification reasons (e.g., `header_mismatch`, `vpn_detected`)

3. **Performance and Scalability**
   - Introduce Redis for rate limiting and temporary IP reputation cache
   - Add batching for log writes to MongoDB to reduce I/O overhead

4. **Data Enrichment**
   - Integrate optional external IP intelligence APIs (for ASN, reputation, botnet feeds)
   - Cache enrichment data with Redis to reduce lookup latency

5. **Model-Based Scoring**
   - Train a simple machine learning model on collected request logs
   - Use it to combine weak signals into stronger bot/human classification

6. **Admin Tools**
   - Enable exporting suspicious traffic logs for further analysis
