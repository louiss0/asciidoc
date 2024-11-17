
import asciidoctor, {
    type Reader,
    type Block, type Document,
    type SyntaxHighlighterFormatOptions,
    type SyntaxHighlighterHighlightOptions,
} from 'asciidoctor'

import { z } from 'astro/zod'


const PATH_TO_THE_FIRST_PAGE = 'src/posts/first-page.adoc'


const processor = asciidoctor()


const HIGHLIGHTER = "shiki"


class ShikiHighlighter extends processor.SyntaxHighlighter {



    // This method is responsible for changing the string
    override format(node: Block, lang: string, opts?: SyntaxHighlighterFormatOptions): string {
        return "I'm shiki"
    }

    //  This method is for changing the highlight. 

    highlight(node: Block, source: string, lang: string, opts: SyntaxHighlighterHighlightOptions) {

        return "I'm Shiki"

    }
}


processor.SyntaxHighlighter.register("shiki", ShikiHighlighter)

processor.Extensions.register(function () {



    this.block("picture", function () {

        this.onContext('pass')

        this.process(function (parent, reader, attributes) {

            return this.createPassBlock(parent,
                `<picture>${reader.getString()}</picture>`,
                attributes,

            )

        })

    })



    this.blockMacro("astro-image", function () {

        this.process(function (parent, target, attrs) {

            //! This code won't work all tests fail if used 
            // let image: Awaited<ReturnType<typeof getImage>>

            // getImage(
            //     {
            //         src: target,
            //         inferSize: true,
            //         ...attrs
            //     },
            //     null
            // ).then((value) => {
            //     image = value
            // }).catch(console.error)


            return this.createImageBlock(
                parent,
                {
                    target,
                    ...attrs
                },
            )

        })

    })





})



type AsciidocGlobalVariables = {
    'source-highlighter': string
    author: string
    backend: string
    filetype: boolean
    localdir: string
    localdate: string
    localdatetime: string
    localtime: string
    localyear: number
    'attribute-missing': 'drop' | 'drop-line' | 'skip' | 'warn'
    'attribute-undefined': 'drop' | 'drop-line'
    experimental: boolean
    'appendix-caption': string
    'appendix-number': string
    'appendix-refsig': string
    'caution-caption': string
    'caution-number': string
    'caution-refsig': string
    'caution-signifier': string
    'example-caption': string
    'example-number': string
    'figure-caption': string
    'figure-number': number
    'footnote-number': number
    'important-caption': string
    'last-update-label': string
    'listing-caption': string
    'listing-number': number
    'note-caption': string
    'part-refsig': string
    'part-signifier': string
    'preface-title': string
    'table-caption': string
    'table-number': string
    'tip-caption': string
    'toc-title': string
    'untitled-label': string
    'warning-caption': string
    'app-name': string
    authors: string
    idprefix: string
    idseparator: string
    leveloffset: 0 | 1 | 2 | 3 | 4 | 5
    partnums: boolean
    setanchors: boolean
    sectids: boolean
    sectlinks: boolean
    sectnums: boolean
    sectnumlevels: 0 | 1 | 2 | 3 | 4 | 5
    'title-separator': string
    toc: true | 'auto' | 'left' | 'right' | 'macro' | 'preamble'
    toclevels: 1 | 2 | 3 | 4 | 5
    fragment: boolean
    stylesheet: string
}



type AsciidocConfig = Partial<{
    attributes: Partial<AsciidocGlobalVariables>
    blocks: Record<string, {
        context: 'example' | 'listing' | 'literal' | 'pass' | 'quote' | 'sidebar'
        processor: (attributes: Record<string, NonNullable<unknown>>, reader: Reader) => string
    }>
    macros: Partial<{
        inline: Record<
            string,
            {
                context: 'quoted' | 'anchor'
                processor: (target: string, attributes: Record<string, NonNullable<unknown>>) => string
            }

        >
        block: Record<string,
            {
                context: 'example' | 'listing' | 'literal' | 'pass' | 'quote' | 'sidebar'
                processor: (target: string, attributes: Record<string, NonNullable<unknown>>) => string
            }>
    }>

}>




function registerBasedOnConfig(config: AsciidocConfig) {

    const processor = asciidoctor()

    const registry = processor.Extensions.create()

    const { attributes, blocks, macros: { block, inline } } = config

    if (blocks) {

        for (const [blockName, blockContextAndProcessor] of Object.entries(blocks)) {


            registry.block(blockName, function () {


                this.process(function (parent, reader, attributes) {


                    return this.createBlock(
                        parent,
                        blockContextAndProcessor.context,
                        blockContextAndProcessor.processor(
                            attributes,
                            reader
                        ),
                        attributes
                    )

                })

            })

        }
    }




    if (inline) {


        for (const [inlineMacroName, inlineMacroContextAndProcessor] of Object.entries(inline)) {

            registry.inlineMacro(inlineMacroName, function () {


                this.process(function (parent, target, attributes) {



                    return this.createInline(
                        parent,
                        inlineMacroContextAndProcessor.context,
                        inlineMacroContextAndProcessor.processor(target, attributes),
                        attributes
                    )

                })

            })
        }

    }

    if (block) {


        for (const [blockMacroName, blockMacroContextAndProcessor] of Object.entries(block)) {

            registry.blockMacro(blockMacroName, function () {


                this.process(function (parent, target, attributes) {


                    return this.createBlock(
                        parent,
                        blockMacroContextAndProcessor.context,
                        blockMacroContextAndProcessor.processor(target, attributes),
                        attributes
                    )

                })

            })
        }


    }




    return (filename: string) => {


        return processor.loadFile(filename, { attributes, extension_registry: registry })

    }

}

const docTest = test.extend<{ doc: Document }>({
    // biome-ignore lint/correctness/noEmptyPattern: Vitest requires this to be there
    async doc({ }, use) {


        const doc = processor.loadFile(
            PATH_TO_THE_FIRST_PAGE,
            {
                attributes: {
                    experimental: true,
                    'source-highlighter': HIGHLIGHTER
                }
            }
        )



        await use(doc)


    }
})


const docUsingDocLoaderTest = test.extend<{ doc: Document }>({
    // biome-ignore lint/correctness/noEmptyPattern: Vitest requires this to be there
    async doc({ }, use) {

        const docLoader = registerBasedOnConfig({
            attributes: {
                experimental: true,
                'source-highlighter': HIGHLIGHTER
            },
            macros: {
                inline: {
                    message: {
                        context: "quoted",
                        processor(target) {
                            return `MESSAGE: ${target}`
                        },
                    }
                },
                block: {
                    greet: {
                        context: "listing",
                        processor(target) {

                            return `Hello ${target}`

                        }
                    }
                }
            }
        })


        await use(docLoader(PATH_TO_THE_FIRST_PAGE))

    }

})

describe('Testing asciidoc', () => {


    docTest("It works", ({ doc }) => {


        expect(doc).not.toBeTypeOf("string")


    })

    docTest("it renders html by default", ({ doc }) => {



        const content = doc.getContent()


        expect(content).toMatch(/<[^>]+>/)


    })

    docTest("it get's the title", ({ doc }) => {



        const title = doc.getTitle()


        expect(title).toBe("Intro to Asciidoc")


    })


    docTest(
        "The document contains important information about it's self",
        ({ doc }) => {



            const docAttributesSchema = z.object({
                doctitle: z.string(),
                author: z.string(),
                description: z.string().optional(),

            })



            const safeParseResult = docAttributesSchema.safeParse(
                doc.getAttributes()
            )

            expect(safeParseResult.success).toBeTruthy()


        }
    )

    docTest('section titles can be queried', ({ doc }) => {




        const sectionTitles = doc.getSections().map(section => section.getTitle())



        expect(sectionTitles).toMatchInlineSnapshot(`
          [
            "Section One",
            "Section Two",
          ]
        `)



    })

    docTest("A slug can be created from the document", ({ doc }) => {


        const slug = doc.getTitle().toLowerCase().replaceAll(/\s+/g, "-")


        expect(slug).toBe("intro-to-asciidoc")

    })

    docTest(
        "an image is rendered when 'astro-image' is rendered on the page ",
        ({ doc }) => {

            expect(doc.getContent()).toMatch(/<img\s+src="\S+"\s+alt=".+"(?:\s+)?>/g)

        })

    docTest.skipIf(HIGHLIGHTER !== 'shiki')
        (
            "code blocks are changed into 'I'm shiki' when using shiki highlighter ",
            ({ doc }) => {

                expect(doc.getContent()).toMatch(/I'm shiki/g)

            }
        )


    docTest(
        "A literal picture block can be used to render a picture element",
        ({ doc }) => {

            expect(doc.getContent()).toMatch(/<picture>.+<\/picture>/g)

        }
    )


    docTest.skip(
        "A literal picture block can be used to render a picture element with interpolation",
        ({ doc }) => {

            expect(doc.getContent()).toMatch(/<picture>.+Brad West.+<\/picture>/g)

        }
    )


})

describe('Testing document loader', () => {


    docUsingDocLoaderTest('it works', ({ doc }) => {


        expect(doc.getContent()).toMatch(/<[^>]+>/g)

    })

    docUsingDocLoaderTest(
        "A greet block macro can be sucessfully registered using the config",
        ({ doc }) => {

            expect(doc.getContent()).toMatch(/Hello\s+.+/g)

        })


    docUsingDocLoaderTest(
        "A inline message macro can be registered using the config file",
        ({ doc }) => {



            expect(doc.getContent()).toMatch(/MESSAGE:\s+.+/g)

        }
    )



})
