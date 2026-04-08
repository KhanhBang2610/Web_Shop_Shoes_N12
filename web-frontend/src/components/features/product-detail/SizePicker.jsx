// src/components/features/product-detail/SizePicker.jsx
const SizePicker = ({ variants, selectedColor, selectedSize, onSelect }) => {
  // Lọc lấy các size có sẵn cho màu đã chọn
  const availableSizes = variants
    .filter(v => v.color === selectedColor)
    .sort((a, b) => a.size - b.size);

  return (
    <div className="size-picker">
      <div className="header">
        <span>Chọn Size (EU)</span>
        <button className="size-guide-btn">Bảng quy đổi size</button>
      </div>
      <div className="size-grid">
        {availableSizes.map((item) => (
          <button
            key={item.id}
            className={`size-item ${selectedSize === item.size ? 'active' : ''} ${item.stock === 0 ? 'out-of-stock' : ''}`}
            onClick={() => item.stock > 0 && onSelect(item.size)}
            disabled={item.stock === 0}
          >
            {item.size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizePicker;