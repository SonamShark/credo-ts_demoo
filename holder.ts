//holder.ts
import { AskarModule } from "@credo-ts/askar"
import { Agent } from "@credo-ts/core"
import { AutoAcceptCredential, ConnectionsModule, CredentialsModule, getDefaultDidcommModules, HttpOutboundTransport, JsonLdCredentialFormatService, V2CredentialProtocol } from "@credo-ts/didcomm"
import { agentDependencies, HttpInboundTransport } from "@credo-ts/node"
import { askar } from '@openwallet-foundation/askar-nodejs'


export const holder = new Agent({
    config: {
        label: "sonam",
        walletConfig: {
            id: "sonam-wallet", 
            key: "sonam1234",    
        },
    },
    modules: {
        ...getDefaultDidcommModules({       
            endpoints: ['http://localhost:9000/didcomm'], // This is the endpoint that the holder will use to send and receive messages
        }),
        connections: new ConnectionsModule({
            autoAcceptConnections: true,
        }),
        credentials: new CredentialsModule({
            autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
            credentialProtocols: [
                new V2CredentialProtocol({
                    credentialFormats: [new JsonLdCredentialFormatService()],
                }),
            ],              
        }),
        askar: new AskarModule({     // This is the module that provides the wallet functionality
            askar
        })
    },
    dependencies: agentDependencies
})
holder.modules.didcomm.registerInboundTransport(new HttpInboundTransport({  // This is the module that provides the inbound transport functionality
    port: 9000, path: '/didcomm',
}))
holder.modules.didcomm.registerOutboundTransport(new HttpOutboundTransport()) // This is the module that provides the outbound transport functionality
       