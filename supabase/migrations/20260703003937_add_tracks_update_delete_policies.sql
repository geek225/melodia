CREATE POLICY "Users can update own tracks." ON tracks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tracks." ON tracks FOR DELETE USING (auth.uid() = user_id);
