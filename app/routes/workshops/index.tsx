import * as React from 'react'
import {useSearchParams} from 'react-router-dom'
import {Grid} from '../../components/grid'
import {images} from '../../images'
import {H6} from '../../components/typography'
import {Tag} from '../../components/tag'
import {CourseSection} from '../../components/sections/course-section'
import {WorkshopCard} from '../../components/workshop-card'
import {HeroSection} from '../../components/sections/hero-section'
import {useWorkshops} from '../../utils/providers'
import {useUpdateQueryStringValueWithoutNavigation} from '../../utils/misc'

export function meta() {
  return {
    title: 'Workshops with Kent C. Dodds',
    description: 'Get really good at making software with Kent C. Dodds',
  }
}

function WorkshopsHome() {
  const data = useWorkshops()

  const tagsSet = new Set<string>()
  for (const workshop of data.workshops) {
    for (const category of workshop.categories) {
      tagsSet.add(category)
    }
  }

  // this bit is very similar to what's on the blogs page.
  // Next time we need to do work in here, let's make an abstraction for them
  const tags = Array.from(tagsSet)
  const [searchParams] = useSearchParams()

  const [queryValue, setQuery] = React.useState<string>(() => {
    return searchParams.get('q') ?? ''
  })
  const workshops = queryValue
    ? data.workshops.filter(workshop =>
        queryValue.split(' ').every(tag => workshop.categories.includes(tag)),
      )
    : data.workshops

  const visibleTags = queryValue
    ? new Set(
        workshops.flatMap(workshop => workshop.categories).filter(Boolean),
      )
    : new Set(tags)

  function toggleTag(tag: string) {
    setQuery(q => {
      // create a regexp so that we can replace multiple occurrences (`react node react`)
      const expression = new RegExp(tag, 'ig')

      const newQuery = expression.test(q)
        ? q.replace(expression, '')
        : `${q} ${tag}`

      // trim and remove subsequent spaces (`react   node ` => `react node`)
      return newQuery.replace(/\s+/g, ' ').trim()
    })
  }

  useUpdateQueryStringValueWithoutNavigation('q', queryValue)

  return (
    <>
      <HeroSection
        title="Check out these remote workshops."
        subtitle="See our upcoming events below."
        imageBuilder={images.teslaX}
        imageSize="large"
      />

      <Grid className="mb-14">
        <div className="flex flex-wrap col-span-full -mb-4 -mr-4 lg:col-span-10">
          {tags.map(tag => (
            <Tag
              key={tag}
              tag={tag}
              selected={queryValue.includes(tag)}
              onClick={() => toggleTag(tag)}
              disabled={!visibleTags.has(tag) && !queryValue.includes(tag)}
            />
          ))}
        </div>
      </Grid>

      <Grid className="mb-64">
        <H6 as="h2" className="col-span-full mb-6">
          {queryValue
            ? `${workshops.length} workshops found`
            : 'Showing all workshops'}
        </H6>

        <div className="col-span-full">
          <Grid nested rowGap>
            {workshops.map(workshop => (
              <div key={workshop.slug} className="col-span-full md:col-span-4">
                <WorkshopCard
                  workshop={workshop}
                  workshopEvent={data.workshopEvents.find(
                    e => e.metadata.workshopSlug === workshop.slug,
                  )}
                />
              </div>
            ))}
          </Grid>
        </div>
      </Grid>

      <CourseSection />
    </>
  )
}

export default WorkshopsHome
