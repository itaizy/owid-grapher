import * as React from 'react'
import { observable, computed, autorun, action, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import * as algoliasearch from 'algoliasearch'
import { ALGOLIA_ID, ALGOLIA_SEARCH_KEY } from 'settings'
import { SearchResults } from './SearchResults'
import { SiteSearchResults } from 'site/siteSearch';

interface PostHit {
    slug: string
    title: string
    postType: 'post'|'page'
    content: string
    excerpt: string
    _highlightResult: any
}

interface ChartHit {
    slug: string
    title: string
    _highlightResult: any
}

interface Results {
    posts: PostHit[]
    charts: ChartHit[]
}

class HeaderSearchResults extends React.Component<{ results: SiteSearchResults }> {
    componentDidMount() {
        document.body.style.overflowY = 'hidden'
    }

    componentWillUnmount() {
        document.body.style.overflowY = null
    }    

    render() {
        return <SearchResults results={this.props.results}/>
    }
}

@observer
export class HeaderSearch extends React.Component {
    @observable.ref results?: Results
    lastQuery?: string

    async runSearch(query: string) {
        const algolia = algoliasearch(ALGOLIA_ID, ALGOLIA_SEARCH_KEY)
        const json = await algolia.search([
            { indexName: 'mispydev_owid_articles', query: query, params: { distinct: true } },
            { indexName: 'mispydev_owid_charts', query: query, params: {} }
        ])

        if (this.lastQuery !== query) {
            // Don't need this result anymore
            return
        }

        runInAction(() => {
            this.results = {
                posts: json.results[0].hits,
                charts: json.results[1].hits
            }    
        })
    }

    @action.bound onSearch(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.currentTarget.value
        this.lastQuery = value
        if (value) {
            this.runSearch(value)
        } else {
            this.results = undefined
        }
    }

    render() {
        const {results} = this
        return <form id="search-nav" action="/search" method="GET" className="HeaderSearch">
            <input type="search" name="q" onChange={e => this.onSearch(e)}/>
            {results && <HeaderSearchResults results={results}/>}
        </form>
    }
}