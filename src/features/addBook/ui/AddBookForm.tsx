'use client';

import { useState } from 'react';
import type { Book, BookSearchResultPreview } from '@/entities/books/model/types';

import { Button } from '@/shared/ui/Button';
import Input from '@/shared/ui/Input/Input';

import { FormEvent } from 'react';

import { useAddBook } from '../model/useAddBook';
import { useBookSearch } from '../model/useBookSearch';

import { AddBookStatusMessage } from './AddBookStatusMessage';
import { BookSectionPicker } from './BookSectionPicker';
import { SearchResultsPanel } from './SearchResultsPanel';
import { AddedSubjectRating } from '@/entities/rating/ui/AddedSubjectRating';
import BookRatingPreview from '@/features/addBook/ui/BookRatingPreview';

type AddBookFormProps = {
  userId: string;
};

export function AddBookForm({ userId }: AddBookFormProps) {
  const [addedBook, setAddedBook] = useState<Book | null>(null);

  const {
    query,
    results,
    selectedBook,
    selectedSections,
    errorMessage,
    isSearching,
    searchBooks,
    selectBook,
    setSelectedSections,
    updateQuery,
  } = useBookSearch();

  const { status, isAdding, addSelectedBook, resetStatus } = useAddBook();

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    resetStatus();

    if (!query.trim()) return;

    void searchBooks(query);
  }

  function handleQueryChange(value: string) {
    resetStatus();
    updateQuery(value);
  }

  function handleSelect(book: BookSearchResultPreview) {
    resetStatus();
    selectBook(book);
  }

  async function handleAddBook() {
    if (!selectedBook) return;

    const book = await addSelectedBook(selectedBook, selectedSections);

    if (book) {
      setAddedBook(book);
    }
  }

  function handleAddAnother() {
    setAddedBook(null);
    resetStatus();
  }

  if (addedBook) {
    return (
      <div className="text-text-inverse flex w-full flex-col items-center gap-8">
        <AddBookStatusMessage
          status={{
            type: 'success',
            message: 'Книга добавлена',
            bookId: addedBook.id,
          }}
        />

        <AddedSubjectRating
          userId={userId}
          subject={{
            type: 'book',
            id: addedBook.id,
          }}
        >
          <BookRatingPreview book={addedBook} />
        </AddedSubjectRating>

        <Button
          type="button"
          variant="primaryOnLight"
          className="w-full"
          onClick={handleAddAnother}
        >
          Добавить ещё
        </Button>
      </div>
    );
  }

  return (
    <div className="text-text-inverse flex w-full flex-col gap-3">
      <form className="flex" onSubmit={handleSearch}>
        <Input
          searchIcon
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          aria-label="Поиск книги"
          placeholder="Название, автор или ISBN"
          className="h-10 rounded-lg pr-8 text-sm"
          disabled={isAdding}
        />
      </form>

      <SearchResultsPanel
        results={results}
        selectedBook={selectedBook}
        isSearching={isSearching}
        onSelect={handleSelect}
      />

      {selectedBook && (
        <BookSectionPicker selectedSections={selectedSections} onChange={setSelectedSections} />
      )}

      {errorMessage && <p className="text-error text-sm">{errorMessage}</p>}

      <AddBookStatusMessage status={status} />

      <Button
        disabled={!selectedBook || isAdding}
        type="button"
        variant="primaryOnLight"
        className="w-full"
        onClick={() => void handleAddBook()}
      >
        {isAdding ? 'Добавление...' : 'Добавить'}
      </Button>
    </div>
  );
}

export default AddBookForm;
