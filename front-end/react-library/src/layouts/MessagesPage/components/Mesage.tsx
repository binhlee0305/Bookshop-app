import { useOktaAuth } from "@okta/okta-react";
import { useEffect, useState } from "react";
import MessageModel from "../../../models/MessageModel";
import { SpinnerLoading } from "../../Utils/SpinnerLoading";
import { Pagination } from "../../Utils/Pagination";

export const Message = () => {

    const { authState } = useOktaAuth();
    const [isLoadingMessage, setIsLoadingMessage] = useState(true);
    const [httpError, setHttpError] = useState(null);

    //Message 
    const [messages, setMessages] = useState<MessageModel[]>([]);

    //Pagination
    const [messagePerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchUserMessages = async () => {
            if (authState && authState?.isAuthenticated) {
                const url = `http://localhost:8080/api/messages/search/findByUserEmail?userEmail=${authState.accessToken?.claims.sub}&page=${currentPage - 1}&size=${messagePerPage}`;
                const requestOptions = {
                    method: "GET",
                    headers: {
                        "Content-type": "application/json"
                    }
                }
                const messagesResponse = await fetch(url, requestOptions);
                if (!messagesResponse.ok) {
                    throw new Error("Something went wrong!!!");
                }
                const messageResponseJson = await messagesResponse.json();

                setMessages(messageResponseJson._embedded.messages);
                setTotalPages(messageResponseJson.page.totalPages);

                setIsLoadingMessage(false);

            }
        }

        fetchUserMessages().catch(error => {
            setIsLoadingMessage(false);
            setHttpError(error.message);
        })
        window.scrollTo(0, 0);

    }, [authState, currentPage])

    if (isLoadingMessage) {
        <SpinnerLoading />
    }

    if (httpError) {
        <div className="container m-5">
            <p>{httpError}</p>
        </div>
    }

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    }

    return (
        <div className="mt-2">
            {messages.length > 0 ?
                <>
                    <h5>Current Q/A: </h5>
                    {messages.map(message => (
                        <div key={message.id}>
                            <div className="card mt-2 shadow p-3 mb-3 bg-body rounded">
                                <h5>Case #{message.id}: {message.title}</h5>
                                <h6>{message.userEmail}</h6>
                                <p>{message.question}</p>
                                <hr />
                                <div>
                                    <h5>Response: </h5>
                                    {message.response && message.adminEmail ?
                                        <>
                                            <h6>{message.adminEmail} (admin)</h6>
                                            <p>{message.response}</p>
                                        </>
                                        :
                                        <p><i>Pending response from administation. Please be patient.</i></p>
                                    }
                                </div>
                            </div>
                        </div>
                    ))}
                </>
                :
                <h5>All questions you submit will be shown here</h5>
            }

            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />}

        </div>
    );
}