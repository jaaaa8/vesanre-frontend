import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AsyncView from '../components/common/AsyncView'
import Pagination from '../components/common/Pagination'
import Footer from '../components/Footer'
import Header from '../components/Header'
import SearchFilters from '../components/public/SearchFilters'
import VenueCard from '../components/public/VenueCard'
import '../components/public/public.css'
import { useApi } from '../hooks/useApi'
import { useHomeReveal } from '../hooks/useHomeReveal'
import { fallbackPage, needsRewrite } from '../utils/adminRules'
import { getLocations, getSports, searchVenues } from '../utils/api'
import { readSearchParams, SEARCH_SIZE, searchHref } from '../utils/publicRules'

export default function SearchPage({ user, onLogout }) {
  useHomeReveal()
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
    <main>
      <section className="hero sr-hero">
        <div className="hero-bg">
          <div className="hero-bg-inner">
            <img
              src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=2000&q=80&auto=format&fit=crop"
              alt=""
              fetchPriority="high"
            />
            <div className="hero-shade" />
          </div>
        </div>
        <Header user={user} onLogout={onLogout} />
        <div className="sr-head">
          <span className="eyebrow light">
            <i />
            Đặt sân trực tiếp · Gần bạn
          </span>
          <h1 className="sr-title">Tìm sân</h1>
        </div>
        <div className="hero-search">
          <SearchFilters
            key={search.toString()}
            params={params}
            sports={sports.data ?? []}
            locations={locations.data ?? []}
            loading={result.loading}
            onSubmit={(next) => navigate(searchHref(next))}
          />
        </div>
      </section>

      {/* id="venues" lets the shared Header/Footer "Tìm sân" buttons scroll here, as on the home page. */}
      <section className="sr-results" id="venues">
        <span className="eyebrow dark">
          <i />
          Kết quả tìm kiếm
        </span>
        {result.loading && !result.data ? (
          <div className="sr-grid" role="status" aria-label="Đang tải danh sách sân">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="court pub-skeleton" />
            ))}
          </div>
        ) : (
          <AsyncView state={result} empty={result.data?.items.length === 0} emptyText="Không tìm thấy sân phù hợp">
            <div aria-busy={result.loading} className={result.loading ? 'pub-reloading' : undefined}>
              <h2 className="sr-count">
                <b>{result.data?.totalElements}</b> sân phù hợp
              </h2>
              <div className="sr-grid">
                {result.data?.items.map((v) => (
                  <VenueCard key={v.id} venue={v} />
                ))}
              </div>
              <Pagination page={page} totalPages={result.data?.totalPages ?? 0} onChange={(p) => navigate(searchHref({ ...params, page: p }))} />
            </div>
          </AsyncView>
        )}
      </section>
      <Footer />
    </main>
  )
}
