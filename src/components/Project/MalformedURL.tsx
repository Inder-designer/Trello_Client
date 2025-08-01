const MalformedURL = ({status}) => {
    
    return (
        <div className="flex justify-center min-h-screen px-4 pt-16">
            <div className="text-center max-w-xl">
                <img
                    src="https://trello.com/assets/3c7105ff523d79abba48.svg"
                    alt="Invalid link"
                    className="w-40 mx-auto mb-6"
                />
                <h2 className="text-2xl font-bold text-gray-700 mb-3">{status === 404 ? 'Board not found' : 'Malformed URL'}</h2>
                <p className="text-gray-600">
                    {status === 404
                        ? 'This board may be private. If someone gave you this link, they may need to share the board with you or invite you to their Workspace.'
                        : 'The link you entered does not look like a valid Trello link. If someone gave you this link, you may need to ask them to check that it\'s correct.'}
                </p>
            </div>
        </div>
    )
}

export default MalformedURL