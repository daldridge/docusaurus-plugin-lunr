/**
 * Based on code from @docusaurus/theme-search-algolia
 * by Facebook, Inc., licensed under the MIT license.
 */

import React, { useState, useRef, useCallback } from 'react';
import classnames from 'classnames';
import * as lunr from 'lunr';

import { useHistory } from '@docusaurus/router';

import useDocusaurusDocsVersion from '../hooks/version';

import './input.css';
import './autocomplete.css';

const Search = props => {
  const [indexState, setIndexState] = useState('empty');
  const searchBarRef = useRef(null);
  const history = useHistory();

  const currentVersion = useDocusaurusDocsVersion();

  const loadIndex = async () => {
    if (indexState !== 'empty') {
      return;
    }
    setIndexState('loading');

    const indexLoaded = (index, documents, autoComplete) => {
      autoComplete.noConflict();

      autoComplete.default(
        searchBarRef.current,
        {
          hint: false,
          autoselect: true,
          cssClasses: {
            root: 'd-s-l-a'
          }
        },
        [
          {
            source: (input, cb) => {
              const terms = input
                .split(' ')
                .map(each => each.trim().toLowerCase())
                .filter(each => each.length > 0);
              const results = index.query((query) => {
                if (currentVersion) {
                  query.term(currentVersion, { fields: ['version'], presence: lunr.Query.presence.REQUIRED });
                }
                query.term(terms, { fields: ['title', 'content'] });
                query.term(terms, { fields: ['title', 'content'], wildcard: lunr.Query.wildcard.TRAILING })
              }).slice(0, 8);
              cb(results);
            },
            templates: {
              suggestion: function (suggestion) {
                const document = documents.find(document => document.route === suggestion.ref);
                return autoComplete.escapeHighlightedString(document.title);
              },
              empty: () => {
                return 'no results'
              }
            }
          }
        ]
      ).on('autocomplete:selected', function (event, suggestion, dataset, context) {
        history.push(suggestion.ref);
      });
      setIndexState('done');
    }

    const [{ default: searchIndex }, autoComplete] = await Promise.all([
      import(/* webpackChunkName: "search-index" */ '@generated/docusaurus-plugin-lunr/search-index.json'),
      import('autocomplete.js'),
    ]);
    const { documents, index } = searchIndex;
    indexLoaded(lunr.Index.load(index), documents, autoComplete);
  };

  const toggleSearchIconClick = useCallback(() => {
    loadIndex();

    if (indexState === 'done') {
      searchBarRef.current.focus();
    }

    props.handleSearchBarToggle(!props.isSearchBarExpanded);
  }, [props.isSearchBarExpanded, indexState]);

  const handleSearchInputBlur = useCallback(() => {
    props.handleSearchBarToggle(!props.isSearchBarExpanded);
  }, [props.isSearchBarExpanded]);

  return (
    <div className='navbar__search' key='search-box'>
      <span
        aria-label='expand searchbar'
        role='button'
        className={classnames('search-icon', {
          'search-icon-hidden': props.isSearchBarExpanded,
        })}
        onClick={toggleSearchIconClick}
        onKeyDown={toggleSearchIconClick}
        tabIndex={0}
      />
      <input
        id='search_input_react'
        type='search'
        placeholder='Search'
        aria-label='Search'
        className={classnames(
          'navbar__search-input',
          { 'search-bar-expanded': props.isSearchBarExpanded },
          { 'search-bar': !props.isSearchBarExpanded },
        )}
        onMouseOver={loadIndex}
        onFocus={loadIndex}
        onBlur={handleSearchInputBlur}
        ref={searchBarRef}
      />
    </div>
  );
};

export default Search;
