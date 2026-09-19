CREATE TYPE "DecisionAction_new" AS ENUM ('OPEN_LONG', 'OPEN_SHORT', 'HOLD', 'CLOSE', 'NO_TRADE');

ALTER TABLE "decisions"
ALTER COLUMN "action" TYPE "DecisionAction_new"
USING (
	CASE "action"::text
		WHEN 'LONG' THEN 'OPEN_LONG'
		WHEN 'SHORT' THEN 'OPEN_SHORT'
		ELSE "action"::text
	END::"DecisionAction_new"
);

DROP TYPE "DecisionAction";
ALTER TYPE "DecisionAction_new" RENAME TO "DecisionAction";
