const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withUpiQueries(config: any)
{
    return withAndroidManifest(config, (config: any) =>
    {
        const androidManifest = config.modResults.manifest;

        // Ensure a <queries> element exists
        if (!androidManifest.queries)
        {
            androidManifest.queries = [{}];
        }

        const queries = androidManifest.queries[0];

        // Add intent for generic UPI scheme
        queries.intent = queries.intent || [];
        queries.intent.push({
            action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
            data: [{ $: { 'android:scheme': 'upi' } }],
        });

        // Add specific UPI app packages
        queries.package = queries.package || [];
        const packages = [
            'com.phonepe.app',
            'net.one97.paytm',
            'com.google.android.apps.nbu.paisa.user',
            'in.org.npci.upiapp',
        ];
        packages.forEach((pkg) =>
        {
            queries.package.push({ $: { 'android:name': pkg } });
        });

        return config;
    });
};