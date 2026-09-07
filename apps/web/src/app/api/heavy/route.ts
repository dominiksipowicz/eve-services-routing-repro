// Server route pulling heavy external packages, mirroring the production
// service registry: externals are copied whole into the function bundle,
// inflating the traced-file map toward production scale.
export async function GET(): Promise<Response> {
  const [{ google }, Stripe, { BigQuery }] = await Promise.all([
    import('googleapis'),
    import('stripe'),
    import('@google-cloud/bigquery'),
  ]);
  return Response.json({
    google: typeof google,
    stripe: typeof Stripe.default,
    bigquery: typeof BigQuery,
  });
}
