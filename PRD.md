# GLYPH — PHASE 01

## Vibe Coding Product Requirements Document

**Project:** Glyph
**Phase:** Phase 01 — Testnet / MVP
**Category:** Economic Being
**Status:** Build
**Primary Goal:** Prove that Glyph can exist as a persistent digital economic being with an onchain identity, wallet, memory, research process, market decisions, and verifiable economic history.

---

# 1. PRODUCT DEFINITION

## 1.1 What is Glyph?

Glyph is an autonomous digital being with:

* an onchain identity
* its own blockchain wallet
* persistent memory
* economic state
* market research capability
* decision-making capability
* an auditable history of decisions
* reputation
* onchain proof of important actions

Glyph is **not primarily an AI chatbot**.

The AI is one component of Glyph.

The actual product is the **economic life of Glyph**.

The user should be able to observe:

> What Glyph knows → what Glyph researched → what Glyph decided → why Glyph decided it → what happened afterward → how Glyph's economic state changed.

---

# 2. PHASE 01 OBJECTIVE

Phase 01 exists to prove one core loop:

```text
IDENTITY
   ↓
WALLET
   ↓
ECONOMIC STATE
   ↓
RESEARCH
   ↓
DECISION
   ↓
RECORD
   ↓
MEMORY
   ↓
REPUTATION
```

The MVP does NOT need to be a profitable autonomous trader.

The objective is to make Glyph's economic existence:

1. visible
2. persistent
3. explainable
4. reproducible
5. verifiable

---

# 3. CORE PRODUCT PRINCIPLE

## Build this:

> A persistent digital being whose economic state can be observed and verified.

## Do NOT build this:

> An AI chatbot with a crypto wallet attached.

Therefore:

* Chat is secondary.
* The Glyph identity is primary.
* Economic state is primary.
* Decisions are first-class objects.
* Research is first-class data.
* Memory is persistent.
* Onchain activity is evidence.
* UI should communicate the life/state of Glyph.

---

# 4. PHASE 01 SCOPE

## IN SCOPE

### Identity

* Glyph profile
* unique Glyph ID
* ERC-8004-compatible identity
* identity metadata
* identity page
* identity status

### Wallet

* dedicated Glyph wallet
* wallet address
* blockchain/network information
* native/token balances
* transaction history
* explorer links

### Paper Economy

* simulated portfolio
* simulated balance
* assets
* positions
* PnL
* transaction history
* portfolio history

### Research

* market/asset research
* research records
* research sources
* research timestamp
* AI-generated analysis

### Decision

* BUY / SELL / HOLD
* asset
* reasoning
* confidence
* timestamp
* supporting research
* resulting simulated position

### Memory

* important research
* decisions
* outcomes
* economic events
* observations
* lessons

### Reputation

* reputation score/data
* decision history
* completed actions
* consistency/history
* externally verifiable events

### Onchain Proof

* selected Glyph events recorded onchain
* transaction hash
* block/network
* timestamp
* explorer link

### Public Experience

* landing page
* Glyph profile
* economic dashboard
* decision history
* research history
* wallet view
* activity/history

---

# 5. OUT OF SCOPE

Do NOT implement these in Phase 01 unless explicitly requested later:

* real-money trading
* real treasury
* real token ownership as an investment product
* production trading execution
* leverage
* derivatives
* copy trading
* user deposits
* withdrawals
* staking
* DAO governance
* token launch
* NFT marketplace
* complex social network
* arbitrary autonomous browser agent
* unrestricted autonomous spending
* complex multi-agent architecture

Phase 01 is a proof of concept.

Do not turn it into a full trading platform.

---

# 6. IMPORTANT DISTINCTION: PAPER ECONOMY

The Phase 01 paper economy is a **simulation layer**.

Glyph can analyze market information and make simulated economic decisions.

Example:

```text
Glyph researches ETH
       ↓
AI produces research
       ↓
Glyph decides BUY
       ↓
Paper portfolio executes simulated BUY
       ↓
Decision is stored
       ↓
Portfolio changes
       ↓
Future performance is tracked
```

This is NOT a real blockchain trade.

A paper trade must never be represented in the UI as a real transaction.

Use explicit terminology:

* `Paper Trade`
* `Simulated Balance`
* `Simulated Position`
* `Simulated PnL`

Real blockchain activity must use:

* `Onchain Transaction`
* `Wallet Balance`
* `Transaction Hash`

---

# 7. GLYPH IDENTITY

Glyph needs its own persistent identity.

## Identity properties

```text
Glyph
├── glyphId
├── name
├── identityAddress
├── walletAddress
├── network
├── createdAt
├── status
├── metadata
└── reputation
```

The identity should be publicly inspectable.

Example:

```text
Glyph #001

Status
● Active

Identity
0x1234...abcd

Wallet
0xabcd...1234

Network
Ethereum Testnet
```

---

# 8. WALLET

Glyph must have its own blockchain wallet.

The wallet belongs to Glyph, not the user.

The user can observe the wallet.

The user should not need to manually operate Glyph's wallet for normal Phase 01 behavior.

## Wallet UI

Display:

* wallet address
* network
* native balance
* token balances if applicable
* transaction count
* recent transactions
* explorer link

Example:

```text
GLYPH WALLET

0x8F...A21

Ethereum Testnet

Balance
0.42 ETH

Transactions
17
```

---

# 9. ECONOMIC STATE

Glyph must have an explicit economic state.

Example:

```text
Economic State

Cash
$10,000

Portfolio
$10,842

PnL
+$842

Return
+8.42%

Positions
3

Decisions
27
```

The economic state must be derived from stored data.

Do NOT hardcode dashboard numbers.

---

# 10. PAPER PORTFOLIO

## Initial State

Use a configurable initial simulated balance.

Example:

```text
Initial Capital
$10,000
```

This value should be configurable.

## Position

Each position should contain:

```text
asset
quantity
entryPrice
currentPrice
costBasis
marketValue
unrealizedPnL
unrealizedPnLPercent
openedAt
```

## Trade

Each simulated trade should contain:

```text
tradeId
asset
side
quantity
price
totalValue
timestamp
decisionId
```

---

# 11. RESEARCH SYSTEM

Research is a core part of Glyph.

Glyph should not make a decision without a research context.

## Research flow

```text
Select Asset
      ↓
Collect Research Data
      ↓
AI Analysis
      ↓
Research Record
      ↓
Decision
```

Research can include:

* market information
* asset information
* price data
* market trends
* project fundamentals
* relevant news
* onchain information when available
* risk factors
* historical context

---

# 12. AI ANALYSIS

Glyph requires an AI model for analysis.

The AI layer should be abstracted behind a provider interface.

Example:

```text
AIProvider
├── analyzeResearch()
├── generateDecision()
├── summarizeMemory()
└── explainDecision()
```

The application must NOT tightly couple business logic to a single AI provider.

Use an abstraction such as:

```ts
interface AIProvider {
  analyzeResearch(input): Promise<ResearchAnalysis>
  generateDecision(input): Promise<DecisionAnalysis>
}
```

---

# 13. OPENROUTER

OpenRouter is required for Glyph's AI analysis layer in Phase 01.

The API key must only exist on the server.

Never expose:

```text
OPENROUTER_API_KEY
```

to the browser.

Use server-side execution.

Architecture:

```text
Frontend
   ↓
Server Action / API
   ↓
AI Service
   ↓
OpenRouter
   ↓
Selected Model
```

The model must be configurable through environment variables/configuration.

Do not hardcode a model throughout the application.

---

# 14. AI OUTPUT CONTRACT

AI responses must use structured JSON.

Do not rely on free-form text parsing.

Example:

```ts
type DecisionAnalysis = {
  action: "BUY" | "SELL" | "HOLD"
  asset: string
  confidence: number
  thesis: string
  reasoning: string[]
  risks: string[]
  invalidationConditions: string[]
}
```

Validate AI output before storing it.

If AI returns invalid data:

1. reject the result
2. retry if appropriate
3. log the error
4. never create a corrupted decision

---

# 15. DECISION SYSTEM

A decision is a first-class Glyph object.

## Decision

```text
Decision
├── id
├── glyphId
├── asset
├── action
├── confidence
├── thesis
├── reasoning
├── risks
├── researchId
├── status
├── createdAt
└── outcome
```

Possible actions:

```text
BUY
SELL
HOLD
```

---

# 16. DECISION LIFECYCLE

```text
RESEARCH
   ↓
ANALYSIS
   ↓
DECISION CREATED
   ↓
PAPER EXECUTION
   ↓
OUTCOME TRACKING
   ↓
MEMORY UPDATE
```

A decision should not disappear after execution.

It must remain part of Glyph's permanent history.

---

# 17. DECISION DETAIL PAGE

Each decision should show:

### Decision

```text
BUY ETH

Confidence
78%

Created
September 17, 2026
```

### Thesis

Human-readable explanation.

### Reasoning

Structured reasoning points.

### Risks

Potential failure conditions.

### Research

Link to research used.

### Result

Show what happened afterward.

Example:

```text
Decision
BUY

Entry
$3,200

Current
$3,450

Result
+$250
```

Do not rewrite historical reasoning after the fact.

The original decision must remain immutable from the user's perspective.

---

# 18. MEMORY

Glyph needs persistent memory.

Memory should not simply be a chat history.

Memory represents important information that contributes to Glyph's future behavior.

## Memory categories

```text
RESEARCH
DECISION
OUTCOME
OBSERVATION
LESSON
ECONOMIC_EVENT
```

Example:

```text
Memory

Glyph previously decided to buy ETH
after identifying increasing market momentum.

Outcome:
Position gained 7.2%.

Lesson:
Momentum thesis worked under the observed conditions.
```

---

# 19. MEMORY PRINCIPLE

Memory should answer:

> What does Glyph remember about its economic life?

Not:

> What messages did the user send?

Chat history and Glyph memory are different systems.

---

# 20. REPUTATION

Reputation should be based on observable history.

Do not create arbitrary gamification just to make the number look impressive.

Potential reputation inputs:

* completed decisions
* historical outcomes
* consistency
* research quality
* documented reasoning
* onchain verified actions
* historical activity

The exact scoring formula should be isolated so it can be changed later.

Example:

```ts
calculateReputation(glyphHistory)
```

Do not scatter reputation calculations across UI components.

---

# 21. ONCHAIN PROOF

Important Glyph events should be verifiable onchain.

Examples:

```text
Identity Created
Wallet Created
Decision Recorded
Milestone Recorded
```

Not every piece of application data needs to go onchain.

The blockchain should act as a proof layer, not the entire database.

Architecture:

```text
Application Database
        │
        ├── Research
        ├── Decisions
        ├── Memory
        ├── Portfolio
        └── History
              │
              ↓
        Important Events
              │
              ↓
         Blockchain
              │
              ↓
        Proof / Tx Hash
```

---

# 22. DATABASE PRINCIPLE

Use the application database for rich mutable data.

Use blockchain for verifiable proof.

Do not store large AI responses directly onchain.

---

# 23. CORE DATA MODELS

The exact ORM can evolve, but the conceptual models are:

```text
Glyph
Identity
Wallet
Research
ResearchSource
Decision
PaperTrade
Portfolio
PortfolioSnapshot
Memory
Reputation
OnchainProof
Activity
```

---

# 24. RELATIONSHIP MODEL

```text
Glyph
 │
 ├── Identity
 │
 ├── Wallet
 │
 ├── Research
 │      └── ResearchSource
 │
 ├── Decisions
 │      └── PaperTrades
 │
 ├── Portfolio
 │      └── PortfolioSnapshots
 │
 ├── Memory
 │
 ├── Reputation
 │
 └── OnchainProof
```

---

# 25. PUBLIC WEBSITE

The public website should make Glyph understandable without requiring a user account.

## Main pages

```text
/
 /glyph
 /glyph/research
 /glyph/decisions
 /glyph/portfolio
 /glyph/wallet
 /glyph/activity
 /glyph/memory
```

---

# 26. LANDING PAGE

The landing page should NOT look like a generic memecoin landing page.

Avoid:

* giant BUY button as the main hero
* excessive gradients
* generic AI robot mascot
* generic crypto hype language
* fake scarcity
* unnecessary token price focus
* excessive Web3 jargon

The visual language should communicate:

* intelligence
* observation
* economic activity
* persistence
* evidence
* digital identity

---

# 27. HERO CONCEPT

The hero should answer three questions immediately:

### What is Glyph?

A digital economic being.

### What does it do?

Researches, decides, acts, remembers.

### Can I verify it?

Yes. Identity, wallet, history and important actions are observable.

Possible structure:

```text
GLYPH

A digital being with an economic life.

Research.
Decide.
Act.
Remember.

[Explore Glyph]
[View Onchain Identity]
```

---

# 28. GLYPH DASHBOARD

The dashboard is the core product surface.

Suggested layout:

```text
┌──────────────────────────────────────┐
│ GLYPH STATUS                         │
│ Active · Ethereum Testnet            │
├──────────────────────────────────────┤
│ Portfolio      PnL        Decisions  │
│ $10,842        +8.42%     27         │
├──────────────────────────────────────┤
│ Current Positions                    │
│                                      │
│ ETH       $5,200       +8.2%         │
│ BTC       $3,400       +4.1%         │
├──────────────────────────────────────┤
│ Latest Decision                      │
│ BUY ETH                               │
│ Confidence: 78%                      │
├──────────────────────────────────────┤
│ Recent Activity                      │
└──────────────────────────────────────┘
```

---

# 29. ACTIVITY FEED

Activity provides a chronological view of Glyph's life.

Example:

```text
2 min ago
Glyph researched ETH

15 min ago
Glyph created BUY decision

16 min ago
Paper trade executed

1 hour ago
Glyph updated memory

3 hours ago
Decision recorded onchain
```

Activity should make Glyph feel persistent without pretending the AI is human.

---

# 30. AUTHENTICATION

Phase 01 should support an admin/operator account.

The admin is NOT Glyph.

Important distinction:

```text
ADMIN
   ↓
Operates / configures the system

GLYPH
   ↓
The digital economic entity
```

Admin authentication should protect private operations such as:

* triggering research
* triggering analysis
* creating/configuring Glyph
* managing system configuration
* running simulations
* inspecting errors
* managing data

Public Glyph information remains publicly accessible.

---

# 31. ADMIN DASHBOARD

Private admin area:

```text
/admin
/admin/glyph
/admin/research
/admin/decisions
/admin/portfolio
/admin/memory
/admin/onchain
/admin/settings
```

Admin should be able to:

* trigger research
* review AI output
* create/approve decisions where required by Phase 01 implementation
* inspect paper trades
* inspect memory
* inspect blockchain proofs
* inspect system errors
* configure AI model
* configure testnet

---

# 32. SECURITY

Never expose:

* private keys
* seed phrases
* OpenRouter API keys
* database credentials
* server secrets

Use environment variables.

Example:

```env
DATABASE_URL=
OPENROUTER_API_KEY=
WALLET_PRIVATE_KEY=
CHAIN_RPC_URL=
```

Private keys must never be returned to frontend clients.

---

# 33. WALLET SECURITY MODEL

Phase 01 is testnet.

Use a dedicated testnet wallet.

Never use a personal production wallet.

Never store private keys in:

* source code
* Git
* client-side environment variables
* database plaintext if avoidable

The wallet abstraction should make it possible to replace the wallet implementation later.

---

# 34. TECH STACK

Preferred implementation:

```text
Next.js
TypeScript
React
Tailwind CSS
shadcn/ui
Prisma
PostgreSQL
```

Blockchain:

```text
Ethereum-compatible testnet
viem
```

AI:

```text
OpenRouter
```

Authentication:

```text
Use a secure server-side authentication solution.
```

Deployment:

```text
Vercel-compatible architecture
```

---

# 35. ARCHITECTURE PRINCIPLE

Separate the application into layers.

```text
UI
 ↓
Application / Server Actions
 ↓
Domain Services
 ↓
Repositories
 ↓
Database / Blockchain / AI Providers
```

Do not put business logic directly inside React components.

---

# 36. PROVIDER ABSTRACTION

External systems must be abstracted.

Example:

```text
AIProvider
BlockchainProvider
MarketDataProvider
WalletProvider
```

This allows future replacement without rewriting the entire application.

---

# 37. ERROR HANDLING

Every external operation can fail.

Handle:

* AI timeout
* AI invalid JSON
* rate limits
* blockchain RPC errors
* transaction failure
* database errors
* market-data failure
* wallet failure

The UI should show useful states.

Example:

```text
Analyzing...

Analysis failed.
Retry
```

Never silently fail.

---

# 38. LOADING STATES

Important asynchronous actions must have visible states.

Examples:

```text
Researching...
Analyzing...
Creating decision...
Executing paper trade...
Recording proof...
Updating memory...
```

Avoid fake progress bars.

Only show progress representing actual system stages.

---

# 39. EMPTY STATES

Every major page needs a meaningful empty state.

Example:

```text
No decisions yet.

Glyph has not made its first market decision.
```

Do not fill empty states with fake data unless explicitly marked as demo data.

---

# 40. DATA INTEGRITY

Historical records must be preserved.

Once a decision has been created:

* original action must remain
* original reasoning must remain
* original timestamp must remain
* original research reference must remain

Later outcome data can be appended.

Conceptually:

```text
Decision
+
Outcome
=
Complete Historical Record
```

---

# 41. AUDITABILITY

A user should be able to trace:

```text
Decision
 ↓
Research
 ↓
Sources
 ↓
AI Analysis
 ↓
Paper Trade
 ↓
Portfolio Change
 ↓
Outcome
 ↓
Memory
 ↓
Onchain Proof
```

This traceability is one of the most important features of Phase 01.

---

# 42. UI DESIGN PRINCIPLES

Visual direction:

* dark, sophisticated interface
* restrained use of color
* strong typography
* high information density where appropriate
* generous whitespace
* subtle borders
* subtle motion
* minimal decorative noise
* data visualization where useful
* clear hierarchy

Do not make it look like:

* a casino
* a memecoin dashboard
* a generic AI SaaS
* a generic banking dashboard

Glyph should feel like an **observed digital organism with an economic state**.

---

# 43. RESPONSIVE DESIGN

Must work on:

* desktop
* tablet
* mobile

Desktop is the primary experience.

Do not simply shrink desktop layouts on mobile.

---

# 44. ACCESSIBILITY

Implement:

* semantic HTML
* keyboard navigation
* visible focus states
* accessible buttons
* readable contrast
* proper labels
* useful screen-reader descriptions

---

# 45. ANIMATION

Use motion sparingly.

Good uses:

* state transitions
* activity appearing
* portfolio changes
* page transitions
* subtle status indicators

Avoid:

* constant floating animations
* excessive parallax
* distracting background effects
* animation on every component

Motion should communicate state, not decoration.

---

# 46. CORE USER JOURNEY

A visitor should be able to:

```text
LANDING PAGE
      ↓
EXPLORE GLYPH
      ↓
SEE IDENTITY
      ↓
SEE WALLET
      ↓
SEE ECONOMIC STATE
      ↓
SEE RESEARCH
      ↓
SEE DECISIONS
      ↓
OPEN A DECISION
      ↓
TRACE RESEARCH
      ↓
SEE PAPER TRADE
      ↓
SEE OUTCOME
      ↓
SEE MEMORY
      ↓
VERIFY ONCHAIN PROOF
```

This is the primary product narrative.

---

# 47. MVP SUCCESS CRITERIA

Phase 01 is successful when the following works end-to-end:

## Identity

Glyph has a persistent identity.

## Wallet

Glyph has its own testnet wallet.

## Research

Glyph can perform research through the AI layer.

## Decision

Glyph can generate a structured BUY / SELL / HOLD decision.

## Paper Economy

The decision can affect a simulated portfolio.

## Memory

The event can become persistent memory.

## Proof

Important events can have an onchain proof.

## Public Observation

A visitor can inspect the complete history.

---

# 48. GOLDEN PATH

The entire MVP should demonstrate this scenario:

```text
1. Glyph exists.
2. Glyph has an identity.
3. Glyph has a wallet.
4. Glyph starts with simulated capital.
5. Glyph researches an asset.
6. OpenRouter analyzes the research.
7. Glyph produces a structured decision.
8. The decision is stored.
9. A paper trade is executed.
10. Portfolio state changes.
11. The event appears in activity.
12. Glyph remembers the event.
13. An important event is recorded onchain.
14. Visitor can inspect the entire chain of evidence.
```

If this works, Phase 01 has a real product loop.

---

# 49. IMPLEMENTATION ORDER

Do NOT build every feature simultaneously.

Build in vertical slices.

## STEP 1 — Foundation

* Next.js project
* TypeScript
* Tailwind
* shadcn/ui
* database
* environment configuration
* project architecture
* error handling

## STEP 2 — Glyph Identity

* Glyph model
* identity page
* basic public profile
* identity metadata

## STEP 3 — Wallet

* wallet abstraction
* testnet wallet
* wallet address
* balance
* transaction view

## STEP 4 — Paper Economy

* portfolio
* simulated balance
* positions
* paper trades
* portfolio snapshots

## STEP 5 — Research

* research model
* research source
* research UI
* OpenRouter integration
* structured AI response

## STEP 6 — Decision

* decision model
* decision generation
* decision detail
* decision history

## STEP 7 — Research → Decision → Trade

Connect the core loop:

```text
Research
 ↓
AI Analysis
 ↓
Decision
 ↓
Paper Trade
 ↓
Portfolio
```

## STEP 8 — Memory

* memory model
* memory generation
* memory timeline
* connect memory to decisions

## STEP 9 — Onchain Proof

* blockchain provider
* testnet transaction
* proof model
* explorer links

## STEP 10 — Reputation

* reputation calculation
* reputation history
* public reputation display

## STEP 11 — Admin

* authentication
* admin dashboard
* system controls
* logs

## STEP 12 — Polish

* responsive design
* loading states
* empty states
* error states
* animations
* accessibility
* performance
* security review

---

# 50. VIBE CODING RULES

The AI coding agent must follow these rules.

## Rule 1

Do not implement the entire application in one giant change.

Implement one vertical slice at a time.

## Rule 2

Before modifying architecture, inspect the existing codebase.

Do not overwrite working code unnecessarily.

## Rule 3

Do not invent requirements.

If something is unspecified, choose the smallest reasonable implementation and document the assumption.

## Rule 4

Do not add dependencies without a reason.

Prefer existing dependencies.

## Rule 5

Do not duplicate business logic.

Extract reusable domain services.

## Rule 6

Do not hardcode business data.

Use database/configuration.

## Rule 7

Do not fake blockchain transactions.

A simulated action must never be presented as an onchain transaction.

## Rule 8

Do not expose secrets.

All API keys and private keys remain server-side.

## Rule 9

Use strict TypeScript.

Avoid unnecessary `any`.

## Rule 10

Validate external input.

Especially:

* AI output
* API responses
* user input
* blockchain responses

## Rule 11

Every feature must include:

* loading state
* error state
* empty state where applicable
* success state

## Rule 12

Before declaring a feature complete:

1. run type checking
2. run lint
3. run tests if available
4. verify the user flow
5. inspect UI
6. fix errors
7. summarize what changed

---

# 51. AI CODING AGENT BEHAVIOR

The coding agent should act as a senior engineer.

Before coding:

```text
1. Understand the requirement.
2. Inspect the relevant files.
3. Identify dependencies.
4. Determine the smallest implementation.
5. Explain the implementation plan briefly.
6. Implement.
7. Verify.
```

Do not spend excessive time explaining.

Do not ask unnecessary questions.

If the requirement is sufficiently clear, proceed.

If a decision has major architectural consequences and the requirement is genuinely ambiguous, stop and ask.

---

# 52. DEFINITION OF DONE

A feature is NOT done simply because the code compiles.

A feature is done when:

```text
[ ] Correct functionality
[ ] Correct data model
[ ] Correct UI
[ ] Loading state
[ ] Error state
[ ] Empty state
[ ] Validation
[ ] Security considered
[ ] TypeScript passes
[ ] Lint passes
[ ] Build passes
[ ] User flow tested
```

---

# 53. FIRST IMPLEMENTATION TASK

The first implementation should NOT be the AI trading system.

Start with the foundation and Glyph identity.

### First slice:

```text
Next.js App
    ↓
Database
    ↓
Glyph model
    ↓
Create initial Glyph
    ↓
Public Glyph page
    ↓
Display:
    - Name
    - Glyph ID
    - Status
    - Identity
    - Wallet placeholder/state
```

Once this works, continue to the wallet.

The project should grow vertically from the Glyph entity outward.

---

# 54. PHASE 01 BOUNDARY

When deciding whether a feature belongs in Phase 01, ask:

> Does this help prove that Glyph has a persistent, observable and verifiable economic life?

If NO:

Do not build it yet.

If MAYBE:

Defer it.

If YES:

Prioritize it according to the golden path.

---

# 55. FINAL PRODUCT MODEL

Glyph should ultimately be understandable through this model:

```text
                    ┌──────────────┐
                    │    GLYPH     │
                    │              │
                    │   Identity   │
                    │    Wallet    │
                    │    Memory    │
                    │  Reputation  │
                    └──────┬───────┘
                           │
             ┌─────────────┼─────────────┐
             ↓             ↓             ↓
         RESEARCH      DECISION      ECONOMY
             │             │             │
             └─────────────┼─────────────┘
                           ↓
                        HISTORY
                           │
                           ↓
                     ONCHAIN PROOF
```

The central object is **Glyph**, not the chatbot.

The central experience is **observing Glyph's economic life**, not chatting with an AI.

---

# 56. ONE-SENTENCE DEFINITION

> Glyph is a persistent digital economic being with an onchain identity, its own wallet, memory, research process, market decisions, simulated economy, reputation, and verifiable history.

---

# 57. BUILD COMMAND FOR THE VIBE CODING AGENT

When starting implementation, use this instruction:

> Read this PRD completely before making changes. Treat it as the source of truth for Glyph Phase 01. Do not implement the entire product at once. Start with the first implementation slice only. Inspect the existing repository before changing anything. Follow the architecture, data integrity, security, and vibe-coding rules defined here. Do not invent features that are outside the Phase 01 scope. After implementation, run type checking, linting, and build verification, then report exactly what was implemented, what was verified, and what remains.

# END OF PRD
