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

    useEffect(() => {

        const verifyMembership = async () => {
            if (params) {
                setLoading(true)
    
                try {
                    let response: any = {}
    
                    const { merkleTreeDepth, merkleTreeRoot, nullifier, message, points, groupId, mintTo } = params
    
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
                                mintTo,
                                groupId,
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
        }

        verifyMembership()

    }, [])

    return (
        <>
            {fail ? (
                <div className="flashy-message fail-message-proof">Failed! ⛔</div>
            ) : (
                <></>
            )}

            {success ? (
                <div className="flashy-message success-message-proof">Successful! You can enter event!</div>
            ) : (
                <></>
            )}
        </>
    );
}
