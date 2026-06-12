from pydantic import BaseModel


class SendRequest(BaseModel):
    communication_id: int
    campaign_id: int
    customer_id: int
    recipient: str
    channel: str
    message: str


class SendResponse(BaseModel):
    accepted: bool
    communication_id: int
    message: str