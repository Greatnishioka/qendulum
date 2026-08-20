import type { ElementRect } from "./useElementRect";

export type AnimationStartedAt = "top" | "bottom" | "left" | "right";

// 画面上の一点を指すポイント
export type Point = {
    x: number;
    y: number;
};

// serifBoxの幅と高さを表すサイズ
export type Size = {
    width: number;
    height: number;
};

// 尻尾の形状設定
export type TailOptions = {
    length: number;
    halfWidth: number;
    seamOverlap: number;
    tipRoundLength: number;
    boxCornerRadius: number;
};

export type TailPath = {
    fill: string;
    outline: string;
    attachment: Point;
};

// デフォルトの尻尾の形状設定。あまりデフォルトを持ちたくないが、、、
export const defaultTailOptions: TailOptions = {
    length: 29,
    halfWidth: 7,
    seamOverlap: 4,
    tipRoundLength: 10,
    boxCornerRadius: 16,
};

// 二分探索の反復回数。区間の長さを 2^n で割った値が誤差になるので、
// サブピクセル精度が出れば十分（対角線でも 0.05px 未満、線分は 0.05px 未満）。
const rayIterations = 14;
const segmentIterations = 10;

// ============ ベクトル演算 ============

const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });
const sub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
const scale = (point: Point, factor: number): Point => ({
    x: point.x * factor,
    y: point.y * factor,
});
const length = (point: Point): number => Math.hypot(point.x, point.y);
const normalize = (point: Point): Point => scale(point, 1 / length(point));
const lerp = (from: Point, to: Point, ratio: number): Point => add(from, scale(sub(to, from), ratio));

// point を原点中心の矩形(halfSize)の内側に収める
const clampToRect = (point: Point, halfSize: Point): Point => ({
    x: Math.min(halfSize.x, Math.max(-halfSize.x, point.x)),
    y: Math.min(halfSize.y, Math.max(-halfSize.y, point.y)),
});

// ============ 丸角矩形 ============

// 丸角矩形を、角丸半径ぶん内側に縮めた矩形(innerHalfSize)と半径のペアとして表現する。
// この形にしておくと、外周上の点も法線も「内側矩形への最近傍点からの向き」だけで求まる。
type RoundedRect = {
    center: Point;
    innerHalfSize: Point;
    radius: number;
};

function toRoundedRect(boxPosition: Point, boxSize: Size, cornerRadius: number): RoundedRect {
    // radiusの有効な半径は radius <= width / 2 および radius <= height / 2 である必要がある。
    // そのため、それより大きい半径を設定されている場合は、width / 2 または height / 2 に制限する。
    const radius = Math.min(cornerRadius, boxSize.width / 2, boxSize.height / 2);

    return {
        center: {
            x: boxPosition.x + boxSize.width / 2,
            y: boxPosition.y + boxSize.height / 2,
        },
        innerHalfSize: {
            x: boxSize.width / 2 - radius,
            y: boxSize.height / 2 - radius,
        },
        radius,
    };
}

// 中心を原点とした相対座標での符号付き距離。外側が正、内側が負。
function getSignedDistance(relativePoint: Point, rect: RoundedRect): number {
    const q = {
        x: Math.abs(relativePoint.x) - rect.innerHalfSize.x,
        y: Math.abs(relativePoint.y) - rect.innerHalfSize.y,
    };

    return (
        Math.hypot(Math.max(q.x, 0), Math.max(q.y, 0)) + Math.min(Math.max(q.x, q.y), 0) - rect.radius
    );
}

// 内側の点から外側の点へ向かう線分が外周を跨ぐ位置を二分探索する。返すのは外側寄りの比率。
function findBoundaryRatio(
    insidePoint: Point,
    outsidePoint: Point,
    rect: RoundedRect,
    iterations: number,
): number {
    let insideRatio = 0;
    let outsideRatio = 1;

    for (let index = 0; index < iterations; index += 1) {
        const ratio = (insideRatio + outsideRatio) / 2;

        if (getSignedDistance(lerp(insidePoint, outsidePoint, ratio), rect) > 0) {
            outsideRatio = ratio;
        } else {
            insideRatio = ratio;
        }
    }

    return outsideRatio;
}

// 外周上の点における外向き法線。内側矩形への最近傍点から見た向きがそのまま法線になる。
function getOutwardNormal(relativePoint: Point, rect: RoundedRect, fallback: Point): Point {
    const fromInnerPoint = sub(relativePoint, clampToRect(relativePoint, rect.innerHalfSize));

    return length(fromInnerPoint) > 0 ? normalize(fromInnerPoint) : fallback;
}

// 尻尾の付け根となる外周上の点と、その位置での外向き法線を求める
function getRoundedRectAttachment(
    boxPosition: Point, // boxの左上の座標
    boxSize: Size, // boxの幅と高さ
    anchor: Point, // 尻尾の先端が向く座標
    cornerRadius: number, // boxの角丸の半径
) {
    const rect = toRoundedRect(boxPosition, boxSize, cornerRadius);
    const relativeAnchor = sub(anchor, rect.center);
    const closestInnerPoint = clampToRect(relativeAnchor, rect.innerHalfSize);
    const fromInnerPoint = sub(relativeAnchor, closestInnerPoint);

    // anchorがboxの外にある場合は、内側矩形への最近傍点から半径ぶん進めば外周上の点になる
    if (length(fromInnerPoint) > rect.radius) {
        const normal = normalize(fromInnerPoint);

        return {
            attachment: add(rect.center, add(closestInnerPoint, scale(normal, rect.radius))),
            normal,
        };
    }

    // anchorがboxの内側にある場合は向きが定まらないので、中心から anchor 方向へ外周を探す
    const direction =
        relativeAnchor.x === 0 && relativeAnchor.y === 0
            ? { x: 0, y: -1 }
            : normalize(relativeAnchor);
    const farPoint = scale(direction, Math.hypot(boxSize.width, boxSize.height));
    const relativeAttachment = scale(farPoint, findBoundaryRatio(
        { x: 0, y: 0 },
        farPoint,
        rect,
        rayIterations,
    ));

    return {
        attachment: add(rect.center, relativeAttachment),
        normal: getOutwardNormal(relativeAttachment, rect, direction),
    };
}

// insidePoint から outsidePoint へ向かう線分が、boxの外周から出る点
function getRoundedRectExitPoint(
    insidePoint: Point,
    outsidePoint: Point,
    boxPosition: Point,
    boxSize: Size,
    cornerRadius: number,
): Point {
    const rect = toRoundedRect(boxPosition, boxSize, cornerRadius);
    const ratio = findBoundaryRatio(
        sub(insidePoint, rect.center),
        sub(outsidePoint, rect.center),
        rect,
        segmentIterations,
    );

    return lerp(insidePoint, outsidePoint, ratio);
}

// ============ 位置決め ============

export function getInitialBoxPosition(
    anchor: Point,
    boxSize: Size,
    animationStartedAt: AnimationStartedAt,
    tailLength: number,
    targetRect?: ElementRect,
): Point {
    // targetRectが無い場合はanchorを大きさゼロの矩形として扱い、以降の分岐を揃える
    const rect: ElementRect = targetRect ?? {
        top: anchor.y,
        left: anchor.x,
        width: 0,
        height: 0,
    };

    switch (animationStartedAt) {
        case "left":
            return {
                x: rect.left + rect.width + tailLength,
                y: anchor.y - boxSize.height / 2,
            };
        case "top":
            return {
                x: anchor.x - boxSize.width / 2,
                y: rect.top + rect.height + tailLength,
            };
        case "bottom":
            return {
                x: anchor.x - boxSize.width / 2,
                y: rect.top - tailLength - boxSize.height,
            };
        case "right":
        default:
            return {
                x: rect.left - tailLength - boxSize.width,
                y: anchor.y - boxSize.height / 2,
            };
    }
}

export function doRectsOverlap(boxPosition: Point, boxSize: Size, targetRect?: ElementRect) {
    return (
        !!targetRect &&
        boxPosition.x < targetRect.left + targetRect.width &&
        boxPosition.x + boxSize.width > targetRect.left &&
        boxPosition.y < targetRect.top + targetRect.height &&
        boxPosition.y + boxSize.height > targetRect.top
    );
}

// ============ 尻尾のパス ============

// tipからendpointの向きにdistanceだけ進んだ点。尻尾の先端を丸めるための制御点に使う
function getPointAwayFromTip(tip: Point, endpoint: Point, distance: number): Point {
    return add(tip, scale(normalize(sub(endpoint, tip)), distance));
}

export function createTailPath(
    boxPosition: Point,
    boxSize: Size,
    anchor: Point,
    options: TailOptions,
): TailPath | null {
    // boxSizeが存在しない場合はnullを返す
    if (!boxSize.width || !boxSize.height) {
        return null;
    }

    const { attachment, normal } = getRoundedRectAttachment(
        boxPosition,
        boxSize,
        anchor,
        options.boxCornerRadius,
    );
    const towardAnchor = sub(anchor, attachment);
    const unitDirection =
        towardAnchor.x === 0 && towardAnchor.y === 0 ? normal : normalize(towardAnchor);

    // 付け根はboxの内側に少し埋めて、境界線との継ぎ目が見えないようにする
    const baseCenter = sub(attachment, scale(normal, options.seamOverlap));
    const tangent = { x: -normal.y, y: normal.x };
    const first = add(baseCenter, scale(tangent, options.halfWidth));
    const second = sub(baseCenter, scale(tangent, options.halfWidth));
    const tip = add(attachment, scale(unitDirection, options.length));
    const firstTipCurvePoint = getPointAwayFromTip(tip, first, options.tipRoundLength);
    const secondTipCurvePoint = getPointAwayFromTip(tip, second, options.tipRoundLength);

    // fillとoutlineは先端側の描画が共通で、boxに接する両端だけが異なる
    const tipCommands =
        `L ${firstTipCurvePoint.x} ${firstTipCurvePoint.y} ` +
        `Q ${tip.x} ${tip.y} ${secondTipCurvePoint.x} ${secondTipCurvePoint.y} `;
    const toPathCommands = (from: Point, to: Point) =>
        `M ${from.x} ${from.y} ` + tipCommands + `L ${to.x} ${to.y}`;
    const exitPoint = (from: Point) =>
        getRoundedRectExitPoint(from, tip, boxPosition, boxSize, options.boxCornerRadius);

    return {
        // fillはboxの内側から始めて塗りを繋げ、outlineは外周から出た点だけを線でなぞる
        fill: `${toPathCommands(first, second)} Z`,
        outline: toPathCommands(exitPoint(first), exitPoint(second)),
        attachment,
    };
}
