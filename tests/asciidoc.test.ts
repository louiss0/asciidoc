
import asciidoctor, { type Document } from 'asciidoctor'
import { z } from 'astro/zod'


const processor = asciidoctor()

const PATH_TO_THE_FIRST_PAGE = 'src/posts/first-page.adoc'

const docTest = test.extend<{ doc: Document }>({
    // biome-ignore lint/correctness/noEmptyPattern: <explanation>
    async doc({ }, use) {

        const doc = processor.loadFile(PATH_TO_THE_FIRST_PAGE,)


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



})


