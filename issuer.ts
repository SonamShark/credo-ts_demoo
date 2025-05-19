//issuer.ts
import { AskarModule } from "@credo-ts/askar";
import { Agent } from "@credo-ts/core";
import { AutoAcceptCredential, Connection, ConnectionsModule, CredentialsModule, getDefaultDidcommModules, HttpOutboundTransport, JsonLdCredentialFormatService, V2CredentialProtocol } from "@credo-ts/didcomm";
import { agentDependencies, HttpInboundTransport } from "@credo-ts/node";
import { askar } from '@openwallet-foundation/askar-nodejs'

export const issuer = new Agent({
    config: {
        label: 'TTPL',
        walletConfig: {
            id: 'ttpl-wallet',
            key: 'ttpl123'
        }
     },
    modules: {
        ...getDefaultDidcommModules({
            endpoints: ['http://localhost:9001/didcomm']
        }),
        connection: new ConnectionsModule({
            autoAcceptConnections: true
          }),
        credentials: new CredentialsModule({
            autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
            credentialProtocols: [
                new V2CredentialProtocol({
                    credentialFormats: [new JsonLdCredentialFormatService()]
                })
            ]
         }),
        askar: new AskarModule({// This is the module that provides the wallet functionality
            askar
        })
    },
    dependencies: agentDependencies
 });
issuer.modules.didcomm.registerInboundTransport(new HttpInboundTransport({port:9001, path: '/didcomm'}))// This is the module that provides the inbound transport functionality
issuer.modules.didcomm.registerOutboundTransport(new HttpOutboundTransport())// This is the module that provides the outbound transport functionality