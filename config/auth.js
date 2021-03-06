module.exports = {
    'secret'  : process.env.FB_CLIENT_ID || 'SECRET',
    'facebookAuth' : {
        'clientID'      : process.env.FB_CLIENT_ID, // your App ID
        'clientSecret'  : process.env.FB_CLIENT_SECRET, // your App Secret
        'callbackURL'   : process.env.FB_CALLBACK,
        // 'profileURL'    : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        'profileFields' : ['id', 'email', 'name','friends','photos','profileUrl'], // For fields normalization
        'scope'         : ['public_profile', 'email']
        // 'scope'         : ['public_profile', 'email', 'user_friends'] //https://developers.facebook.com/docs/facebook-login/permissions/
    },
};
