
import asciidoctor, { type Document } from 'asciidoctor'
import { z } from 'astro/zod'


const processor = asciidoctor()

const PATH_TO_THE_FIRST_PAGE = 'src/posts/first-page.adoc'

describe('Testing asciidoc', () => {


    test("It works", () => {

        const doc = processor.convertFile(PATH_TO_THE_FIRST_PAGE)

        expect(doc).not.toBeTypeOf("string")


    })

    test("it renders html by default", () => {

        const doc = processor.convertFile(PATH_TO_THE_FIRST_PAGE) as unknown as Document


        const content = doc.getContent()


        expect(content).toMatch(/<[^>]+>/)


    })

    test("it get's the title", () => {

        const doc = processor.convertFile(PATH_TO_THE_FIRST_PAGE) as unknown as Document


        const title = doc.getTitle()




        expect(title).toBe("Intro to Asciidoc")


    })


    test(
        "The document contains important information about it's self",
        () => {


            const doc = processor.convertFile(PATH_TO_THE_FIRST_PAGE) as unknown as Document

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



})


