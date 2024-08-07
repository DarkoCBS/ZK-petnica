"use client"

import { useParams } from "next/navigation"
import { useCallback, useContext, useEffect, useState } from "react"
import Feedback from "../../../../contract-artifacts/Feedback.json"
import LogsContext from "../../../context/LogsContext"


export default function ProofsPage() {
    const searchParams = useParams();
    const { setLogs } = useContext(LogsContext)
    const [_loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [fail, setFail] = useState(false)

    const params = JSON.parse(decodeURIComponent(searchParams.id as unknown as string))

    const verifyMembership = useCallback(async () => {
        if (params) {
            setLoading(true)

            try {
                let response: any = {}

                const { merkleTreeDepth, merkleTreeRoot, nullifier, message, points } = params

                if (process.env.OPENZEPPELIN_AUTOTASK_WEBHOOK) {
                    response = await fetch(process.env.OPENZEPPELIN_AUTOTASK_WEBHOOK, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            abi: Feedback.abi,
                            address: process.env.FEEDBACK_CONTRACT_ADDRESS,
                            functionName: "verifyMembership",
                            functionParameters: [merkleTreeDepth, merkleTreeRoot, nullifier, message, points]
                        })
                    })
                } else {
                    response = await fetch("/api/feedback", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            feedback: message,
                            merkleTreeDepth,
                            merkleTreeRoot,
                            nullifier,
                            points,
                            mintTo: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
                            groupId: 0,
                        })
                    })
                }

                if (response.status === 200) {
                    setLogs(`Your feedback has been posted 🎉`)
                    setSuccess(true)
                } else {
                    setLogs("Some error occurred, please try again!")
                    setFail(true)
                }
            } catch (error) {
                console.error(error)

                setLogs("Some error occurred, please try again!")
                setFail(true)
            } finally {
                setLoading(false)
            }
        }
    }, [params, setLogs])

    return (
        <>
            <h2>Proofs</h2>

            <p>
                Semaphore members can anonymously
            </p>

            <div className="divider"></div>

            {!(fail || success) ? (
                <div>
                    <button className="button" onClick={verifyMembership} disabled={_loading}>
                        <span>Send Feedback</span>
                        {_loading && <div className="loader"></div>}
                    </button>
                </div>
            ) : <></>}

            {fail ? (
                <div>Failed!</div>
            ) : (
                <></>
            )}

            {success ? (
                <div>Successful!</div>
            ) : (
                <></>
            )}
        </>
    )
}
