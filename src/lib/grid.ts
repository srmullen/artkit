export class Grid<T> {
  nRows: number;
  nCols: number;
  rows: T[][] = [];

  constructor(nx: number, ny: number, item: (x: number, y: number) => T) {
    this.nRows = ny;
    this.nCols = nx;

    for (let i = 0; i < nx; i++) {
      let col: T[] = [];
      for (let j = 0; j < ny; j++) {
        let point = item(i, j);
        col.push(point);
      }
      this.rows.push(col);
    }
  }

  *colByRow(): IterableIterator<{ x: number, y: number, idx: number }> {
    let idx = 0;
    for (let x = 0; x < this.nCols; x++) {
      for (let y = 0; y < this.nRows; y++) {
        yield { x, y, idx, };
        idx++;
      }
    }
  }

  *rowByCol(): IterableIterator<{ x: number, y: number, idx: number }> {
    let idx = 0;
    for (let y = 0; y < this.nRows; y++) {
      for (let x = 0; x < this.nCols; x++) {
        yield { x, y, idx };
        idx++;
      }
    }
  }

  *zigZagRows(): IterableIterator<{ x: number, y: number, idx: number }> {
    let idx = 0;
    for (let y = 0; y < this.nRows; y++) {
      for (let x = 0; x < this.nCols; x++) {
        yield { x, y, idx };
        idx++;
      }
      y++;
      if (y < this.nRows) {
        for (let x = this.nCols - 1; x >= 0; x--) {
          yield { x, y, idx };
          idx++;
        }
      }
    }
  }

  *zigZagCols(): IterableIterator<{ x: number, y: number, idx: number }> {
    let idx = 0;
    for (let x = 0; x < this.nCols; x++) {
      for (let y = 0; y < this.nRows; y++) {
        yield { x, y, idx };
        idx++;
      }
      x++;
      if (x < this.nRows) {
        for (let y = this.nRows - 1; y >= 0; y--) {
          yield { x, y, idx };
          idx++;
        }
      }
    }
  }

  at(row: number, col: number): T {
    return this.rows[row]?.[col];
  }
}