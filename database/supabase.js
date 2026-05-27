const { createClient } =
require('@supabase/supabase-js')

const supabase =
createClient(

'https://eextshaeqrhaeevlosex.supabase.co',

'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVleHRzaGFlcXJoYWVldmxvc2V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NjM4MDQsImV4cCI6MjA5NTQzOTgwNH0.poPZA0dqC5lpEU2EgLE2F4OTvqoZNcHUv-2hpZ0vAxI'

)

module.exports =
supabase
