
import asciidoctor, { type Document, } from 'asciidoctor'
import { z } from 'astro/zod'


const PATH_TO_THE_FIRST_PAGE = 'src/posts/first-page.adoc'


const processor = asciidoctor()


processor.Extensions.register(function () {

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


const docTest = test.extend<{ doc: Document }>({
    // biome-ignore lint/correctness/noEmptyPattern: <explanation>
    async doc({ }, use) {


        const doc = processor.loadFile(
            PATH_TO_THE_FIRST_PAGE,
            {
                attributes: {
                    experimental: true,
                    highlighter: 'shiki'
                }
            }
        )



        await use(doc)


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



})


