
type props = {
    messageType: "error" | "success" | "info";
    message: string;
    className: string
}

export default function MessageBox({ messageType, message, className }: props) {

    return (

        // 雑にコンパイル通すためにclassNameの追加を敢行(todo: 要修正)
        <div className={`${messageType === "error" ? "bg-red-100 text-red-700" : messageType === "success" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"} ${className}`}>
            <div className="">
                <p className="">
                    {message}
                </p>
            </div>
            <svg width="21" height="17" viewBox="0 0 21 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0L9.52628 16.5C9.91118 17.1667 10.8734 17.1667 11.2583 16.5L20.7846 0H0Z" fill="white" />
                <path d="M0.577148 1L9.52567 16.5C9.91057 17.1667 10.8732 17.1667 11.2581 16.5L20.2066 1H19.0525L10.3919 16L1.73127 1H0.577148Z" fill="black" />
            </svg>
        </div>
    );
}