# ---------------------------------------------------------------------------
# EventBridge — Hourly RSS ingestion trigger → Lambda
# ---------------------------------------------------------------------------

resource "aws_cloudwatch_event_rule" "ingestion" {
  name                = "pulsenews-ingestion-${var.environment}"
  description         = "Trigger RSS ingestion every 15 minutes"
  schedule_expression = "rate(15 minutes)"
}

resource "aws_cloudwatch_event_target" "ingestion_lambda" {
  rule = aws_cloudwatch_event_rule.ingestion.name
  arn  = aws_lambda_function.ingest.arn
}

resource "aws_lambda_permission" "eventbridge_ingest" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ingest.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.ingestion.arn
}
