class PriorityQueue {
  constructor(compareFn) {
    this.elements = [];
    // Default is min-heap
    this.compare = compareFn ?? ((a, b) => a.priority < b.priority);
  }

  leftChild(index) {
    return 2 * index + 1;
  }

  rightChild(index) {
    return 2 * index + 2;
  }

  parent(index) {
    return Math.floor((index - 1) / 2);
  }

  swap(i, j) {
    [this.elements[i], this.elements[j]] = [this.elements[j], this.elements[i]];
  }

  heapifyUp(index) {
    while (
      index > 0 &&
      this.compare(this.elements[index], this.elements[this.parent(index)])
    ) {
      this.swap(index, this.parent(index));
      index = this.parent(index);
    }
  }

  heapifyDown(index) {
    const length = this.elements.length;

    while (true) {
      let target = index;
      const left = this.leftChild(index);
      const right = this.rightChild(index);

      if (
        left < length &&
        this.compare(this.elements[left], this.elements[target])
      ) {
        target = left;
      }

      if (
        right < length &&
        this.compare(this.elements[right], this.elements[target])
      ) {
        target = right;
      }

      if (target !== index) {
        this.swap(index, target);
        index = target;
      } else {
        break;
      }
    }
  }

  enqueue(value, priority) {
    const newItem = { value, priority };
    this.elements.push(newItem);
    this.heapifyUp(this.elements.length - 1);
  }

  isEmpty() {
    return this.elements.length === 0;
  }

  dequeue() {
    if (this.isEmpty()) return null;

    const top = this.elements[0];
    const end = this.elements.pop();
    if (!this.isEmpty()) {
      this.elements[0] = end;
      this.heapifyDown(0);
    }

    return top.value;
  }

  size() {
    return this.elements.length;
  }

  peek() {
    return this.isEmpty() ? null : this.elements[0].value;
  }

  print() {
    console.log(
      this.elements.map((i) => `(${i.value}, p:${i.priority})`).join(" ")
    );
  }
}

export { PriorityQueue };