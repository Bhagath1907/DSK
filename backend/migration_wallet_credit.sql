-- SQL Migration for Wallet Credit Function
-- Run this in your Supabase SQL Editor

-- Allow users to update their own wallet balance
CREATE POLICY "Users can update own wallet" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own transactions
CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a secure function to credit wallet (prevents abuse)
CREATE OR REPLACE FUNCTION public.credit_wallet_topup(
  p_plan_name text,
  p_payment_reference text DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_amount decimal(10, 2);
  v_current_balance decimal(10, 2);
  v_new_balance decimal(10, 2);
  v_recent_tx_count int;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Validate plan and get amount
  CASE p_plan_name
    WHEN 'Go' THEN v_amount := 100.00;
    WHEN 'Pro' THEN v_amount := 300.00;
    WHEN 'Plus' THEN v_amount := 600.00;
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Invalid plan');
  END CASE;
  
  -- Rate limiting: Check for recent top-ups (prevent abuse)
  SELECT COUNT(*) INTO v_recent_tx_count
  FROM public.transactions
  WHERE user_id = v_user_id
    AND type = 'credit'
    AND created_at > NOW() - INTERVAL '5 minutes';
  
  IF v_recent_tx_count >= 3 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Too many top-ups. Please wait a few minutes.');
  END IF;
  
  -- Get current balance
  SELECT wallet_balance INTO v_current_balance
  FROM public.users
  WHERE id = v_user_id;
  
  v_new_balance := COALESCE(v_current_balance, 0) + v_amount;
  
  -- Update wallet balance
  UPDATE public.users
  SET wallet_balance = v_new_balance
  WHERE id = v_user_id;
  
  -- Create transaction record
  INSERT INTO public.transactions (user_id, amount, type, description)
  VALUES (
    v_user_id, 
    v_amount, 
    'credit', 
    p_plan_name || ' Plan Top-up' || COALESCE(' (Ref: ' || p_payment_reference || ')', '')
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'amount', v_amount,
    'new_balance', v_new_balance,
    'plan', p_plan_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
