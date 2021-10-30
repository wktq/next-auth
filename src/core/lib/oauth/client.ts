import { Issuer, Client } from "openid-client"
import { InternalOptions } from "src/lib/types"

/**
 * NOTE: We can add auto discovery of the provider's endpoint
 * that requires only one endpoint to be specified by the user.
 * Check out `Issuer.discover`
 *
 * Client supporting OAuth 2.x and OIDC
 */
export async function openidClient(
  options: InternalOptions<"oauth">
): Promise<Client> {
  const provider = options.provider

  let issuer
  if (provider.wellKnown) {
    issuer = await Issuer.discover(provider.wellKnown)
  } else {
    issuer = new Issuer({
      issuer: provider.issuer as string,
      authorization_endpoint:
      // @ts-expect-error
      provider.authorization?.url ?? provider.authorization,
      // @ts-expect-error
      token_endpoint: provider.token?.url ?? provider.token,
      // @ts-expect-error
      userinfo_endpoint: provider.userinfo?.url ?? provider.userinfo,
    })
  }

  const client = new issuer.Client(
    {
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
      redirect_uris: [provider.callbackUrl],
      ...provider.client,
    },
    provider.jwks
  )

  return client
}
