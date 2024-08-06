"use client"

import { Identity } from "@semaphore-protocol/core"
import { useRouter } from "next/navigation"
import { useCallback, useContext, useEffect, useState } from "react"
import Stepper from "../components/Stepper"
import LogsContext from "../context/LogsContext"

export default function IdentitiesPage() {
    const router = useRouter()
    const { setLogs } = useContext(LogsContext)
    const [_identity, setIdentity] = useState<Identity>()

    useEffect(() => {
        const privateKey = localStorage.getItem("identity")

        if (privateKey) {
            const identity = new Identity(privateKey)

            setIdentity(identity)

            setLogs("Your Semaphore identity has been retrieved from the browser cache 👌🏽")
        } else {
            setLogs("Create your Semaphore identity 👆🏽")
        }
    }, [setLogs])

    const createIdentity = useCallback(async () => {

        let account;

        if (typeof window.ethereum !== 'undefined') {
            try {
                account = await window.ethereum.request({ method: 'eth_requestAccounts' });
            } catch (error) {
                console.error('User rejected the request');
            }
        }
        
        const exampleMessage = "I wanna join Petnica."
        
        try {
            const from = account[0];
            // For historical reasons, you must submit the message to sign in hex-encoded UTF-8.
            // This uses a Node.js-style buffer shim in the browser.
            const msg = `0x${Buffer.from(exampleMessage, "utf8").toString("hex")}`

            let sign;

            if(window.ethereum as Window){
                sign = await window.ethereum.request({
                    method: "personal_sign",
                    params: [msg, from],
                })
            }

            const identity = new Identity(sign);

            setIdentity(identity)
    
            localStorage.setItem("identity", identity.privateKey.toString())
    
            setLogs("Your new Semaphore identity has just been created 🎉")
    
        } catch (err) {
            console.error(err)
        }

    }, [setLogs])

    return (
        <>
            <h2 className="font-size: 3rem;">Identities</h2>

            <p>
                The identity of a user in the Semaphore protocol. A{" "}
                <a
                    href="https://docs.semaphore.pse.dev/guides/identities"
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                >
                    Semaphore identity
                </a>{" "}
                consists of an{" "}
                <a
                    href="https://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/eddsa-poseidon"
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                >
                    EdDSA
                </a>{" "}
                public/private key pair and a commitment, used as the public identifier of the identity.
            </p>

            <div className="divider"></div>

            <div className="text-top">
                <h3>Identity</h3>
                {_identity && (
                    <button className="button-link" onClick={createIdentity}>
                        New
                    </button>
                )}
            </div>

            {_identity ? (
                <div>
                    <div className="box">
                        <p className="box-text">Private Key: {_identity.privateKey.toString()}</p>
                        <p className="box-text">Commitment: {_identity.commitment.toString()}</p>
                    </div>
                </div>
            ) : (
                <div>
                    <button className="button" onClick={createIdentity}>
                        Create identity
                    </button>
                </div>
            )}

            <div className="divider"></div>

            <Stepper step={1} onNextClick={_identity && (() => router.push("/groups"))} />
        </>
    )
}
