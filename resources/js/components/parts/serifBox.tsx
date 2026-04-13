type props = {
    children: React.ReactNode;
    setIsOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
    isOpen: boolean;
    title: string;
    position: {
        top: number;
        left: number;
    };
    // sizeが設定されている場合は、SerifBoxの幅と高さをそれに合わせる。設定されていない場合は内容に合わせる
    drawingArea?: {
        width?: number;
        height?: number;
    };
};

export default function SerifBox({ children, setIsOpenModal, isOpen, title, position, drawingArea }: props) {

    return (
        <div
            className={`fixed z-50 flex -translate-x-full -translate-y-1/2 justify-center items-center transition-all duration-250 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0 -translate-y-[calc(50%+8px)]"}`}
            style={{ top: position.top, left: position.left }}
        >
            <div
                className="
                relative overflow-hidden rounded-2xl border border-(--color-dark) qendulum-shadow
            "
            >
                <div className="relative z-20 py-1.5 px-5 flex justify-between border-b border-(--color-dark) bg-white">
                    <h3 className="text-(--color-turquoise) text-xs font-bold">{title}</h3>
                    <button type="button" onClick={() => setIsOpenModal(false)} className="">
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect width="14" height="14" rx="7" fill="#DF4646" />
                            <path
                                d="M10.1182 4.70703L7.8252 7L10.2363 9.41113L9.5293 10.1182L7.11816 7.70703L4.70703 10.1182L4 9.41113L6.41113 7L4.11816 4.70703L4.8252 4L7.11816 6.29297L9.41113 4L10.1182 4.70703Z"
                                fill="white"
                            />
                        </svg>
                    </button>
                </div>
                <div className="relative z-10 p-1 bg-white">
                    <div className="rounded-b-2xl rounded-t-sm py-1.5 bg-[#EDEDED] flex items-start justify-center px-8">
                        <div style={{ width: drawingArea?.width, height: drawingArea?.height }} className="overflow-hidden">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
            <svg
                className="relative z-20 -left-0.5"
                width="29"
                height="14"
                viewBox="0 0 29 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M0.000148773 -1.26082e-06L27.1755 4.56428C29.4005 4.93797 29.4005 8.13533 27.1755 8.50902L0.000148202 13.0733L0.000148773 -1.26082e-06Z"
                    fill="white"
                />
                <path
                    d="M0.918945 0.154052L27.1757 4.56414C29.4004 4.93795 29.4004 8.13564 27.1757 8.50945L0.918945 12.9195L0.918945 11.9055L27.0096 7.52312C28.1221 7.33628 28.1221 5.73732 27.0096 5.55047L0.918945 1.16811L0.918945 0.154052Z"
                    fill="#E3E3E3"
                />
            </svg>
        </div>
    );
}
