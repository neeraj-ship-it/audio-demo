import { render, screen } from '@testing-library/react'
import SearchBar from '../../components/SearchBar'

// Mock localStorage for the SearchBar component
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value }),
    removeItem: jest.fn((key) => { delete store[key] }),
    clear: jest.fn(() => { store = {} }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

const defaultProps = {
  searchQuery: '',
  onSearchChange: jest.fn(),
  sortBy: 'latest',
  onSortChange: jest.fn(),
  resultCount: 42,
  stories: [],
}

describe('SearchBar component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  it('renders the search input', () => {
    render(<SearchBar {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search stories by title or category...')
    expect(input).toBeInTheDocument()
  })

  it('renders the sort dropdown with correct default value', () => {
    render(<SearchBar {...defaultProps} />)
    const select = screen.getByDisplayValue('Latest First')
    expect(select).toBeInTheDocument()
  })

  it('renders sort dropdown options', () => {
    render(<SearchBar {...defaultProps} />)
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(2)
    expect(options[0]).toHaveTextContent('Latest First')
    expect(options[1]).toHaveTextContent('A-Z')
  })

  it('shows result count', () => {
    render(<SearchBar {...defaultProps} />)
    expect(screen.getByText('42 stories')).toBeInTheDocument()
  })

  it('shows different result count when prop changes', () => {
    render(<SearchBar {...defaultProps} resultCount={7} />)
    expect(screen.getByText('7 stories')).toBeInTheDocument()
  })

  it('renders with provided search query value', () => {
    render(<SearchBar {...defaultProps} searchQuery="horror" />)
    const input = screen.getByPlaceholderText('Search stories by title or category...')
    expect(input.value).toBe('horror')
  })
})
