"use client"

import { Group, Identity, generateProof } from "@semaphore-protocol/core"
import QRCode from "react-qr-code";
import { useParams, useRouter } from "next/navigation"
import { useCallback, useContext, useEffect, useState } from "react"
import Stepper from "../../../../components/Stepper"
import Feedback from "../../../../../contract-artifacts/Feedback.json"
import LogsContext from "../../../../context/LogsContext"
import SemaphoreContext from "../../../../context/SemaphoreContext"

export default function ProofsPage() {
    const router = useRouter()
    const searchParams = useParams()
    const { setLogs } = useContext(LogsContext)
    const { _users, _feedback, refreshFeedback, addFeedback } = useContext(SemaphoreContext)
    const [_loading, setLoading] = useState(false)
    const [_identity, setIdentity] = useState<Identity>()
    const [_proof, setProof] = useState<{
        points: any, merkleTreeDepth: any, merkleTreeRoot: any, nullifier: any, message: any, groupId: any
    }>()
    const params = JSON.parse(decodeURIComponent(searchParams.id as unknown as string))

    useEffect(() => {
        const privateKey = localStorage.getItem("identity")

        if (!privateKey) {
            router.push("/")
            return
        }

        setIdentity(new Identity(privateKey))
    }, [router])

    useEffect(() => {
        if (_feedback.length > 0) {
            setLogs(`${_feedback.length} feedback retrieved from the group 🤙🏽`)
        }
    }, [_feedback, setLogs])

    const enterEvent = useCallback(async () => {
        if (!_identity) {
            return
        }

        const feedback = prompt("Please enter your feedback:")

        if (feedback && _users) {
            setLoading(true)

            setLogs(`Posting your anonymous feedback...`)

            try {
                const group = new Group(_users)

                const { points, merkleTreeDepth, merkleTreeRoot, nullifier, message } = await generateProof(
                    _identity,
                    group,
                    "membership",
                    params
                )

                setProof({
                    points, merkleTreeDepth, merkleTreeRoot, nullifier, message, groupId: params,
                })

            } catch (error) {
                console.error(error)

                setLogs("Some error occurred, please try again!")
            } finally {
                setLoading(false)
            }
        }
    }, [_identity, _users, addFeedback, setLogs])

    console.log(`localhost:3000/proofs/${encodeURIComponent(JSON.stringify(_proof))}`)

    return (
        <>
            <h2>Proofs</h2>

            <p>
                Semaphore members can anonymously{" "}
                <a
                    href="https://docs.semaphore.pse.dev/guides/proofs"
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                >
                    prove
                </a>{" "}
                that they are part of a group and send their anonymous messages. Messages could be votes, leaks,
                reviews, feedback, etc.
            </p>

            <div className="divider"></div>

            <div className="text-top">
                <h3>Feedback messages ({_feedback.length})</h3>
                <button className="button-link" onClick={refreshFeedback}>
                    Refresh
                </button>
            </div>

            <div>
                <button className="button" onClick={enterEvent} disabled={_loading}>
                    <span>Send Feedback</span>
                    {_loading && <div className="loader"></div>}
                </button>
            </div>

            {_feedback.length > 0 && (
                <div>
                    {_feedback.map((f, i) => (
                        <div key={i}>
                            <p className="box box-text">{f}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="divider"></div>

            {
                _proof ? (
                    <>
                    <div style={{ background: 'white', padding: '16px' }}>
                     <QRCode value={`localhost:3000/proofs/${encodeURIComponent(JSON.stringify(_proof))}`} />
                    </div>
                    </>
                ) : <></>
            }

            <Stepper step={3} onPrevClick={() => router.push("/join")} />
        </>
    )
}
