"use client"

import { Group, Identity, generateProof } from "@semaphore-protocol/core"
import QRCode from "react-qr-code";
import { useParams, useRouter } from "next/navigation"
import { useCallback, useContext, useEffect, useState } from "react"
import Stepper from "../../../../components/Stepper"
import Feedback from "../../../../../contract-artifacts/Feedback.json"
import LogsContext from "../../../../context/LogsContext"
import SemaphoreContext from "../../../../context/SemaphoreContext"
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'

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

    const downloadQRCode = () => {
        const qrCodeElement = document.getElementById('qrCode');
        if (qrCodeElement) {
            html2canvas(qrCodeElement).then(canvas => {
                canvas.toBlob(blob => {
                    if (blob) {
                        saveAs(blob, 'qrcode.png');
                    }
                });
            });
        }
    }

    useEffect(() => {
        if (_feedback.length > 0) {
            setLogs(`${_feedback.length} feedback retrieved from the group 🤙🏽`)
        }
    }, [_feedback, setLogs])

    const enterEvent = useCallback(async () => {
        if (!_identity) {
            return
        }

        if (_users) {
            setLoading(true)

            setLogs(`Posting your anonymous feedback...`)

            try {
                let response;
                if (process.env.OPENZEPPELIN_AUTOTASK_WEBHOOK) {
                    response = await fetch(process.env.OPENZEPPELIN_AUTOTASK_WEBHOOK, {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },

                    })
                } else {
                    response = await fetch(`/api/commitments?groupId=${params}`, {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                    })
                }

                const res = await response.json()

                console.log(res.data)
                console.log(_users)

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
            <div>
                <button className="button-stepper" onClick={refreshFeedback}>Refresh</button>
            </div>
            <div>
                <button className="button" onClick={enterEvent} disabled={_loading}>
                    <span>Get QR code ticket</span>
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
                    <div id="qrCode" className="qrcode-container">
                        <QRCode value={`localhost:3000/proofs/${encodeURIComponent(JSON.stringify(_proof))}`} />
                    </div>
                    <p className="qr-text">This is your proof as QR code. Show it at event entrance.</p>
                    <button className="button" onClick={downloadQRCode}>Download QR Code</button>
                    </>
                ) : <></>
            }
            <Stepper step={3} onPrevClick={() => router.push("/groups")} />
        </>
    )
}
