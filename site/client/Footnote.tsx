import { Tippy } from "charts/Tippy"
import { parseIntOrUndefined } from "charts/Util"
import React from "react"
import ReactDOM from "react-dom"

export const Footnote = ({
    index,
    href,
    htmlContent,
    triggerTarget
}: {
    index: number
    href: string
    htmlContent?: string
    triggerTarget?: Element
}) => {
    return (
        <Tippy
            appendTo={() => document.body}
            content={
                htmlContent && (
                    <div>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: htmlContent
                            }}
                        />
                    </div>
                )
            }
            interactive
            placement="auto"
            theme="owid-footnote"
            trigger="mouseenter focus click"
            triggerTarget={triggerTarget}
        >
            <a
                id={`ref-${index}`}
                className="ref"
                href={href}
                // Prevent scrolling to footnotes section
                onClick={e => e.preventDefault()}
            >
                <sup>{index}</sup>
            </a>
        </Tippy>
    )
}

interface FootnoteContent {
    index: number
    href: string
    htmlContent: string
}

function getFootnoteContent(element: Element): FootnoteContent | null {
    const href = element.closest("a.ref")?.getAttribute("href")
    if (!href) return null

    const index = parseIntOrUndefined(href.split("-")[1])
    if (index === undefined) return null

    const referencedEl = document.querySelector(href)
    if (!referencedEl?.innerHTML) return null
    return { index, href, htmlContent: referencedEl.innerHTML }
}

export function runFootnotes() {
    const footnotes = document.querySelectorAll("a.ref")

    footnotes.forEach(f => {
        const footnoteContent = getFootnoteContent(f)
        if (footnoteContent == null) return

        ReactDOM.hydrate(
            <Footnote
                index={footnoteContent.index}
                href={footnoteContent.href}
                htmlContent={footnoteContent.htmlContent}
                triggerTarget={f}
            />,
            f
        )
    })
}