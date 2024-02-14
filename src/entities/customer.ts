interface CustomerProps {
  max_limit: number;
  balance: number;
}

export class Customer {
  constructor(private _max_limit: number, private _balance: number) {}

  get maxLimit() {
    return this._max_limit;
  }

  static create(data: CustomerProps) {
    return new Customer(data.max_limit, data.balance);
  }
}
