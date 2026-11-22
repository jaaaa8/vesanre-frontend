import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AsyncView from '../components/common/AsyncView'
import Pagination from '../components/common/Pagination'
import PublicTopbar from '../components/public/PublicTopbar'
import SearchFilters from '../components/public/SearchFilters'
import VenueCard from '../components/public/VenueCard'
import '../components/public/public.css'
import { useApi } from '../hooks/useApi'
import { fallbackPage, needsRewrite } from '../utils/adminRules'
import { getLocations, getSports, searchVenues } from '../utils/api'
import { readSearchParams, SEARCH_SIZE, searchHref } from '../utils/publicRules'

export default function SearchPage() {
  const [search] = useSearchParams()
  const navigate = useNavigate()
  const params = readSearchParams(search)
  const { q, city, district, sport, minPrice, maxPrice, sort, page } = params
  const result = useApi(() => searchVenues({ ...params, size: SEARCH_SIZE }), [q, city, district, sport, minPrice, maxPrice, sort, page])
  const locations = useApi(getLocations, [])
  const sports = useApi(getSports, [])
  const rewrite = needsRewrite(search, params)

  useEffect(() => {
    if (rewrite) navigate(searchHref(params), { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewrite, search])

  useEffect(() => {
    if (result.loading || !result.data) return
    const p = fallbackPage(page, result.data.items, result.data.totalPages)
    if (p !== null) navigate(searchHref({ ...params, page: p }), { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.data, result.loading])

  return (
    <div className="pub-page">
      <PublicTopbar />
      <main className="pub-main">
        <h1>Tìm sân</h1>
        <SearchFilters
          key={search.toString()}
          params={params}
          sports={sports.data ?? []}
          locations={locations.data ?? []}
          loading={result.loading}
          onSubmit={(next) => navigate(searchHref(next))}
        />
        {result.loading && !result.data ? (
          <div className="pub-grid" role="status" aria-label="Đang tải danh sách sân">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="pub-card pub-skeleton" />
            ))}
          </div>
        ) : (
          <AsyncView state={result} empty={result.data?.items.length === 0} emptyText="Không tìm thấy sân phù hợp">
            <div aria-busy={result.loading} className={result.loading ? 'pub-reloading' : undefined}>
              <p className="pub-count">{result.data?.totalElements} sân phù hợp</p>
              <div className="pub-grid">
                {result.data?.items.map((v) => (
                  <VenueCard key={v.id} venue={v} />
                ))}
              </div>
              <Pagination page={page} totalPages={result.data?.totalPages ?? 0} onChange={(p) => navigate(searchHref({ ...params, page: p }))} />
            </div>
          </AsyncView>
        )}
      </main>
    </div>
  )
}
