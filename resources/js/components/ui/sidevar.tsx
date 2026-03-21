import { type sidevarPropaty } from "@/types/sidevar";

type props = {
    propaties: sidevarPropaty[]
};

// 状態を持たないのであれば、別に下層コンポーネントを作らなくてもパフォーマンスは問題ないのでは？
export default function SideVar({ propaties }: props) {

    return (
        <nav className="flex-1 sticky overflow-hidden">
            <ul className="group">
                {propaties.map(propaty => {
                    return (
                        <li
                            className="
                            sidebar-item
                            border-b border-(--color-dark)
                            "
                            key={propaty.label}
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
                                e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
                            }}
                        >
                            <a href={propaty.link} className="">
                                <div className="relative py-4">
                                    <div className="flex pl-6">{propaty.label}</div>
                                    <span className="block absolute -bottom-1 -right-1 aspect-square h-2 border border-(--color-dark)"></span>
                                </div>
                            </a>
                        </li>
                    );
                })}

            </ul>
        </nav>
    );
}
