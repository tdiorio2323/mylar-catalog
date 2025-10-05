import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://dotfloiygvhsujlwzqgv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdGZsb2l5Z3Zoc3VqbHd6cWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTQ4NzUsImV4cCI6MjA2ODY3MDg3NX0.pMqR9o0kRT6NI3EEDFEbq339ZWWUfijNjoPBN-lf6a0'
);

async function testDashboard() {
    console.log('🔍 Testing Dashboard Functionality...\n');

    try {
        // Test 1: Sign in as admin
        console.log('1. Testing admin authentication...');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'tyler.diorio@gmail.com',
            password: 'Newstart23!'
        });

        if (authError) {
            console.log('❌ Auth failed:', authError.message);
            return;
        }
        console.log('✅ Successfully signed in as:', authData.user.email);

        // Test 2: Check VIP codes table
        console.log('\n2. Testing VIP codes access...');
        const { data: codes, error: codesError } = await supabase
            .from('vip_codes')
            .select('code, role, uses_remaining, expires_at')
            .order('created_at', { ascending: false })
            .limit(5);

        if (codesError) {
            console.log('❌ VIP codes error:', codesError.message);
        } else {
            console.log(`✅ Found ${codes.length} VIP codes`);
            codes.forEach(code => {
                console.log(`   - ${code.code} (${code.role}, ${code.uses_remaining} uses left)`);
            });
        }

        // Test 3: Check admin emails
        console.log('\n3. Testing admin access...');
        const { data: adminEmails, error: adminError } = await supabase
            .from('admin_emails')
            .select('email, added_at');

        if (adminError) {
            console.log('❌ Admin emails error:', adminError.message);
        } else {
            console.log(`✅ Found ${adminEmails.length} admin emails:`);
            adminEmails.forEach(admin => {
                console.log(`   - ${admin.email}`);
            });
        }

        // Test 4: Test VIP function (this should work from authenticated client)
        console.log('\n4. Testing mint_vip_code function...');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const { data: newCode, error: functionError } = await supabase.rpc('mint_vip_code', {
            p_code: null, // Auto-generate
            p_role: 'client',
            p_uses: 5,
            p_expires_at: expiresAt.toISOString(),
            p_metadata: { test: 'dashboard-verification' }
        });

        if (functionError) {
            console.log('⚠️ Function error (expected in some cases):', functionError.message);
        } else {
            console.log('✅ Successfully created VIP code:', newCode);
        }

        console.log('\n🎉 Dashboard test complete!');
        console.log('\n📋 Dashboard URLs to test manually:');
        console.log('   • Overview: https://book.cabanagrp.com/dashboard');
        console.log('   • VIP Codes: https://book.cabanagrp.com/dashboard/codes');
        console.log('   • Users: https://book.cabanagrp.com/dashboard/users');
        console.log('   • Bookings: https://book.cabanagrp.com/dashboard/bookings');
        console.log('   • Vetting: https://book.cabanagrp.com/dashboard/vetting');
        console.log('   • Deposits: https://book.cabanagrp.com/dashboard/deposits');
        console.log('   • Settings: https://book.cabanagrp.com/dashboard/settings');

    } catch (error) {
        console.log('❌ Unexpected error:', error.message);
    }
}

testDashboard().catch(console.error);