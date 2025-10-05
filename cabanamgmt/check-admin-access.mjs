import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  'https://dotfloiygvhsujlwzqgv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdGZsb2l5Z3Zoc3VqbHd6cWd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA5NDg3NSwiZXhwIjoyMDY4NjcwODc1fQ._h0D0P7oqsUlzPJkCv2ebKYSrJLjI9Bg_4khjRvYysw',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function checkAdminEmails() {
  console.log('Checking admin emails...\n');
  
  // Get current admin emails
  const { data: adminEmails, error } = await supabaseAdmin
    .from('admin_emails')
    .select('email, added_at')
    .order('added_at');

  if (error) {
    console.error('Error fetching admin emails:', error.message);
    return;
  }

  console.log('Current admin emails:');
  adminEmails.forEach(admin => {
    console.log(`- ${admin.email} (added: ${new Date(admin.added_at).toLocaleDateString()})`);
  });

  // Check if both emails exist
  const emails = adminEmails.map(a => a.email);
  const tylerTdStudios = emails.includes('tyler@tdstudiosny.com');
  const tylerGmail = emails.includes('tyler.diorio@gmail.com');

  console.log('\nAdmin access verification:');
  console.log(`✅ tyler@tdstudiosny.com: ${tylerTdStudios ? 'HAS ACCESS' : 'NO ACCESS'}`);
  console.log(`${tylerGmail ? '✅' : '❌'} tyler.diorio@gmail.com: ${tylerGmail ? 'HAS ACCESS' : 'NO ACCESS'}`);

  // Add tyler.diorio@gmail.com if missing
  if (!tylerGmail) {
    console.log('\nAdding tyler.diorio@gmail.com to admin_emails...');
    const { error: insertError } = await supabaseAdmin
      .from('admin_emails')
      .insert({ email: 'tyler.diorio@gmail.com' });

    if (insertError) {
      console.error('Error adding admin email:', insertError.message);
    } else {
      console.log('✅ Successfully added tyler.diorio@gmail.com as admin');
    }
  }

  console.log('\n📋 Summary:');
  console.log('Both admin emails should now have identical access to:');
  console.log('- Dashboard at /dashboard');
  console.log('- VIP code management at /dashboard/codes');
  console.log('- All admin-only functions');
}

checkAdminEmails().catch(console.error);