/**
 * Test script for Team Invitation Management API endpoints
 * 
 * This script tests:
 * 1. Admin login
 * 2. Create invitation
 * 3. Get pending invites
 * 4. Get organization members
 * 5. Validate invite token
 * 6. Accept invitation
 * 7. Deactivate member
 */

const BASE_URL = 'http://localhost:3500/api/v1';

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            credentials: 'include', // Important for cookies
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const data = await response.json();
        
        // Get all set-cookie headers - Node.js fetch returns them as a single string
        const setCookieHeader = response.headers.get('set-cookie');
        
        return {
            status: response.status,
            ok: response.ok,
            data,
            cookies: setCookieHeader ? [setCookieHeader] : [],
        };
    } catch (error) {
        console.error('Request failed:', error.message);
        throw error;
    }
}

// Extract cookies from response
function extractCookies(cookieHeaders) {
    if (!cookieHeaders || cookieHeaders.length === 0) return '';
    // Handle both array and string formats
    const headers = Array.isArray(cookieHeaders) ? cookieHeaders : [cookieHeaders];
    // Extract just the cookie name=value pairs, ignoring attributes
    const cookies = headers.map(header => {
        const cookiePart = header.split(';')[0];
        return cookiePart;
    }).join('; ');
    return cookies;
}

async function runTests() {
    console.log('🚀 Starting Team Invitation Management API Tests\n');
    
    let adminCookies = '';
    let inviteToken = '';
    let newUserId = '';
    let organizationId = '';

    try {
        // Test 1: Admin Login
        console.log('📝 Test 1: Admin Login');
        const loginResponse = await makeRequest(`${BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@techcorp.com',
                password: 'admin123',
            }),
        });

        if (loginResponse.ok) {
            adminCookies = extractCookies(loginResponse.cookies);
            organizationId = loginResponse.data.data.organizationId;
            console.log('✅ Admin login successful');
            console.log(`   Organization ID: ${organizationId}\n`);
        } else {
            console.log('❌ Admin login failed:', loginResponse.data.message);
            console.log('   Note: Make sure you have an admin user in the database\n');
            return;
        }

        // Test 2: Create Invitation
        console.log('📝 Test 2: Create Invitation');
        const inviteResponse = await makeRequest(`${BASE_URL}/organizations/invite`, {
            method: 'POST',
            headers: {
                Cookie: adminCookies,
            },
            body: JSON.stringify({
                email: `test-${Date.now()}@example.com`,
                role: 'RECRUITER',
            }),
        });

        if (inviteResponse.ok) {
            inviteToken = inviteResponse.data.data.invite.token;
            console.log('✅ Invitation created successfully');
            console.log(`   Email: ${inviteResponse.data.data.invite.email}`);
            console.log(`   Role: ${inviteResponse.data.data.invite.role}`);
            console.log(`   Token: ${inviteToken}`);
            console.log(`   Invite URL: ${inviteResponse.data.data.inviteUrl}`);
            console.log(`   Expires At: ${inviteResponse.data.data.invite.expiresAt}\n`);
        } else {
            console.log('❌ Invitation creation failed:', inviteResponse.data.message, '\n');
        }

        // Test 3: Get Pending Invites
        console.log('📝 Test 3: Get Pending Invites');
        const pendingInvitesResponse = await makeRequest(`${BASE_URL}/organizations/invites`, {
            method: 'GET',
            headers: {
                Cookie: adminCookies,
            },
        });

        if (pendingInvitesResponse.ok) {
            console.log('✅ Pending invites retrieved successfully');
            console.log(`   Total pending invites: ${pendingInvitesResponse.data.data.length}`);
            if (pendingInvitesResponse.data.data.length > 0) {
                console.log(`   First invite: ${pendingInvitesResponse.data.data[0].email}\n`);
            }
        } else {
            console.log('❌ Failed to get pending invites:', pendingInvitesResponse.data.message, '\n');
        }

        // Test 4: Get Organization Members
        console.log('📝 Test 4: Get Organization Members');
        const membersResponse = await makeRequest(`${BASE_URL}/organizations/members`, {
            method: 'GET',
            headers: {
                Cookie: adminCookies,
            },
        });

        if (membersResponse.ok) {
            console.log('✅ Organization members retrieved successfully');
            console.log(`   Total members: ${membersResponse.data.data.length}`);
            membersResponse.data.data.forEach((member, index) => {
                console.log(`   ${index + 1}. ${member.name} (${member.email}) - ${member.role} - Active: ${member.isActive}`);
            });
            console.log('');
        } else {
            console.log('❌ Failed to get organization members:', membersResponse.data.message, '\n');
        }

        // Test 5: Validate Invite Token
        if (inviteToken) {
            console.log('📝 Test 5: Validate Invite Token');
            const validateResponse = await makeRequest(`${BASE_URL}/auth/invites/${inviteToken}/validate`, {
                method: 'GET',
            });

            if (validateResponse.ok) {
                console.log('✅ Invite token validated successfully');
                console.log(`   Organization: ${validateResponse.data.data.organizationName}`);
                console.log(`   Role: ${validateResponse.data.data.role}`);
                console.log(`   Email: ${validateResponse.data.data.email}\n`);
            } else {
                console.log('❌ Invite token validation failed:', validateResponse.data.message, '\n');
            }

            // Test 6: Accept Invitation
            console.log('📝 Test 6: Accept Invitation');
            const acceptResponse = await makeRequest(`${BASE_URL}/auth/accept-invite`, {
                method: 'POST',
                body: JSON.stringify({
                    token: inviteToken,
                    name: 'Test User',
                    password: 'password123',
                }),
            });

            if (acceptResponse.ok) {
                newUserId = acceptResponse.data.data.id;
                console.log('✅ Invitation accepted successfully');
                console.log(`   User ID: ${newUserId}`);
                console.log(`   Name: ${acceptResponse.data.data.name}`);
                console.log(`   Email: ${acceptResponse.data.data.email}`);
                console.log(`   Role: ${acceptResponse.data.data.role}\n`);
            } else {
                console.log('❌ Invitation acceptance failed:', acceptResponse.data.message, '\n');
            }
        }

        // Test 7: Deactivate Member
        if (newUserId && organizationId) {
            console.log('📝 Test 7: Deactivate Member');
            const deactivateResponse = await makeRequest(
                `${BASE_URL}/organizations/${organizationId}/members/${newUserId}/deactivate`,
                {
                    method: 'PATCH',
                    headers: {
                        Cookie: adminCookies,
                    },
                }
            );

            if (deactivateResponse.ok) {
                console.log('✅ Member deactivated successfully');
                console.log(`   Message: ${deactivateResponse.data.message}\n`);
            } else {
                console.log('❌ Member deactivation failed:', deactivateResponse.data.message, '\n');
            }
        }

        // Test 8: Verify member is deactivated
        if (newUserId) {
            console.log('📝 Test 8: Verify Member Deactivation');
            const verifyResponse = await makeRequest(`${BASE_URL}/organizations/members`, {
                method: 'GET',
                headers: {
                    Cookie: adminCookies,
                },
            });

            if (verifyResponse.ok) {
                const deactivatedMember = verifyResponse.data.data.find(m => m.id === newUserId);
                if (deactivatedMember && !deactivatedMember.isActive) {
                    console.log('✅ Member deactivation verified');
                    console.log(`   ${deactivatedMember.name} is now inactive\n`);
                } else {
                    console.log('❌ Member deactivation verification failed\n');
                }
            }
        }

        console.log('🎉 All tests completed!\n');

    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

// Run the tests
runTests();
