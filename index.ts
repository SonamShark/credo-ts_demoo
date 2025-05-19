//index.ts

import { issuer } from "./issuer";
import { holder } from "./holder";
import { CREDENTIALS_CONTEXT_V1_URL, KeyType } from "@credo-ts/core";
import { BasicMessageRole, OutOfBandInvitation } from "@credo-ts/didcomm";

const app = async () => {
  // Init issuer agent & wallet
  await issuer.initialize();
  // Init holder & wallet
  await holder.initialize();

  // Create issuer DID
  const issuerDIDResult = await issuer.dids.create({
    method: 'key',
    options: {
      keyType: KeyType.Ed25519,
    },
  });
  const issuerDID = issuerDIDResult.didState.did;
  console.log('\n\n\n\n issuerDIDResult = ', JSON.stringify(issuerDID, null, 2));

  // Create holder DID
  const holderDIDResult = await holder.dids.create({
    method: 'key',
    options: {
      keyType: KeyType.Ed25519,
    },
  });
  const holderDID = holderDIDResult.didState.did;
  console.log('\n\n\n\n holderDIDResult = ', JSON.stringify(holderDID, null, 2));

  // Create credential offer
  const credentialOffer = await issuer.modules.credentials.createOffer({
    credentialFormats: {
      jsonld: {
        credential: {
          "@context": [
            CREDENTIALS_CONTEXT_V1_URL,
            "http://www.w3.org/2018/credentials/examples/v1",
          ],
          type: ["VerifiableCredential", "UniversityDegreeCredential"],
          issuer: issuerDID ?? "",
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: holderDID ?? "",
            degree: {
              type: "BachelorDegree",
              name: "Bachelor of Science and Arts",
            },
          },
        },
        options: {
          proofType: 'Ed25519Signature2018',
          proofPurpose: 'assertionMethod',
        },
      },
    },
    protocolVersion: 'v2',
  });

  console.log('\n\n\n\n Credential Offer = ', JSON.stringify(credentialOffer, null, 2));

  // Create invitation
  const invitation = await issuer.modules.oob.createInvitation({
    messages: [credentialOffer.message],
  });

  // Holder receives invitation
  const { connectionRecord } = await holder.modules.oob.receiveInvitation(invitation.outOfBandInvitation);

  if (connectionRecord === undefined) {
    throw new Error("Connection not found");
    }
  await holder.modules.connections.returnWhenIsConnected(connectionRecord.id);
  await new Promise((resolve) => setTimeout(resolve, 5000))

  const updateRecord = await holder.modules.connections.getAll()
  const credentialRecord = await holder.modules.credentials.getAll()
  console.log('\n\n\n\n CRED records', JSON.stringify(credentialRecord, null, 2));
  await holder.modules.credentials.acceptOffer({
    credentialRecordId: credentialRecord[0].id,
  })

  await new Promise((resolve) => setTimeout(resolve, 10000))

  const updatedCredRecord = await holder.modules.credentials.getAll()
  console.log('\n\n\n\n UPDATED CRED records', JSON.stringify(updatedCredRecord, null, 2));

 // Send message to issuer
const connection = await holder.modules.connections.getAll();

if (!connection) {   
  throw new Error("Connection not found");
}

await holder.modules.basicMessages.sendMessage(
  connection[0].id,
  'Hello Issuer, I am the holder and I have received the credential offer. I am sending you a message to confirm that I have received it.',
);

  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Find all messages sent to the issuer
 const issuermessges = await issuer.modules.basicMessages.findAllByQuery({}) 
console.log('\n\n\n\n ISSUER MESSAGES', JSON.stringify(issuermessges, null, 2));



//send message to holder
const issuerConnections = await issuer.modules.connections.getAll();   //Fetches all active connections the issuer has established.

if (!issuerConnections) {
  throw new Error("Connection not found");
}
await issuer.modules.basicMessages.sendMessage(
  issuerConnections[0].id,
  'Hello Holder, I am the issuer and I have sent you a credential offer.'
);

  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Find all messages sent to the holder
  const holdermessags = await holder.modules.basicMessages.findAllByQuery({
    role: BasicMessageRole.Receiver,
  }) ; 
     console.log('\n\n\n\n HOLDER MESSAGES', JSON.stringify(holdermessags, null, 2));


}


app();