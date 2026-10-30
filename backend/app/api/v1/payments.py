from fastapi import APIRouter

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.get("")
async def get_payments():
    """Phase 2: Payment endpoints (M-Pesa Daraja + Stripe)"""
    return {"message": "Payments - Phase 2 implementation"}


@router.post("/mpesa/stk-push")
async def mpesa_stk_push():
    """Phase 2: M-Pesa STK push"""
    return {"message": "M-Pesa STK push - Phase 2 implementation"}


@router.post("/stripe/webhook")
async def stripe_webhook():
    """Phase 2: Stripe webhook handler"""
    return {"message": "Stripe webhook - Phase 2 implementation"}