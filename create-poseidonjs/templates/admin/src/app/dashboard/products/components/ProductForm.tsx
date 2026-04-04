'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Loader2,
  Palette,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

type VariantAttributeForm = {
  id: string;
  name: string;
  value: string;
};

type VariantFormState = {
  id: string;
  title: string;
  color: string;
  price: string;
  salePrice: string;
  cost: string;
  sku: string;
  barcode: string;
  stock: string;
  lowStock: string;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  image?: string;
  isActive: boolean;
  attributes: VariantAttributeForm[];
};

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  salePrice: string;
  cost: string;
  sku: string;
  barcode: string;
  stock: string;
  lowStock: string;
  collection: string;
  brand: string;
  categories: string[];
  colors: string[];
  tags: string;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  isActive: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  hasVariants: boolean;
};

type ProductFormProps = {
  mode: 'create' | 'edit';
  productId?: string;
};

const defaultDimensions = {
  length: '',
  width: '',
  height: '',
};

const defaultFormState: ProductFormState = {
  name: '',
  description: '',
  price: '',
  salePrice: '',
  cost: '',
  sku: '',
  barcode: '',
  stock: '',
  lowStock: '10',
  collection: '',
  brand: '',
  categories: [],
  colors: [],
  tags: '',
  weight: '',
  dimensions: { ...defaultDimensions },
  isActive: true,
  isFeatured: false,
  isOnSale: false,
  hasVariants: false,
};

const MAX_VARIANT_ATTRIBUTES = 3;
const colorDataListId = 'product-color-options';

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 11);

const buildDimensionsPayload = (dimensions?: { length?: string; width?: string; height?: string }) => {
  if (!dimensions) return undefined;

  const parseValue = (value?: string) => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const length = parseValue(dimensions.length);
  const width = parseValue(dimensions.width);
  const height = parseValue(dimensions.height);

  if (length === undefined && width === undefined && height === undefined) {
    return undefined;
  }

  return { length, width, height };
};

const mapVariantToState = (variant: any): VariantFormState => {
  const optionValues =
    variant?.optionValues instanceof Map
      ? Object.fromEntries(variant.optionValues)
      : variant?.optionValues || {};

  const attributes =
    optionValues && Object.keys(optionValues).length > 0
      ? Object.entries(optionValues).map(([name, value]) => ({
          id: generateId(),
          name,
          value: typeof value === 'string' ? value : String(value),
        }))
      : [
          {
            id: generateId(),
            name: '',
            value: '',
          },
        ];

  return {
    id: variant?._id || generateId(),
    title: variant?.title || '',
    color: variant?.color || '',
    price: variant?.price?.toString() || '',
    salePrice: variant?.salePrice?.toString() || '',
    cost: variant?.cost?.toString() || '',
    sku: variant?.sku || '',
    barcode: variant?.barcode || '',
    stock: variant?.stock?.toString() || '',
    lowStock: variant?.lowStock?.toString() || '10',
    weight: variant?.weight?.toString() || '',
    dimensions: {
      length: variant?.dimensions?.length?.toString() || '',
      width: variant?.dimensions?.width?.toString() || '',
      height: variant?.dimensions?.height?.toString() || '',
    },
    image: variant?.image || variant?.images?.[0] || '',
    isActive: variant?.isActive ?? true,
    attributes,
  };
};

const createEmptyVariant = (): VariantFormState => ({
  id: generateId(),
  title: '',
  color: '',
  price: '',
  salePrice: '',
  cost: '',
  sku: '',
  barcode: '',
  stock: '',
  lowStock: '10',
  weight: '',
  dimensions: { ...defaultDimensions },
  image: '',
  isActive: true,
  attributes: [
    {
      id: generateId(),
      name: '',
      value: '',
    },
  ],
});

const commonColors = [
  'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Black', 'White', 'Gray',
  'Brown', 'Navy', 'Teal', 'Cyan', 'Magenta', 'Lime', 'Maroon', 'Olive', 'Silver', 'Gold',
  'Beige', 'Ivory', 'Coral', 'Salmon', 'Turquoise', 'Indigo', 'Violet', 'Crimson', 'Khaki', 'Tan'
];

export default function ProductForm({ mode, productId }: ProductFormProps) {
  const router = useRouter();
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState<ProductFormState>(defaultFormState);
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantFormState[]>([]);
  const [loading, setLoading] = useState(false);
  const [colorInput, setColorInput] = useState('');
  const [variantUploads, setVariantUploads] = useState<Record<string, boolean>>({});

  const [newCollectionName, setNewCollectionName] = useState('');
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  const { data: categoriesData, refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data.data;
    },
  });

  const { data: collectionsData, refetch: refetchCollections } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const response = await api.get('/collections');
      return response.data.data;
    },
  });

  const { data: brandsData, refetch: refetchBrands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await api.get('/brands');
      return response.data.data;
    },
  });

  const {
    data: productData,
    isLoading: productLoading,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await api.get(`/products/${productId}`);
      return response.data.data;
    },
    enabled: isEditMode && Boolean(productId),
  });

  useEffect(() => {
    if (productData) {
      setFormData({
        ...defaultFormState,
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price?.toString() || '',
        salePrice: productData.salePrice?.toString() || '',
        cost: productData.cost?.toString() || '',
        sku: productData.sku || '',
        barcode: productData.barcode || '',
        stock: productData.stock?.toString() || '',
        lowStock: productData.lowStock?.toString() || '10',
        collection: productData.collection?._id || productData.collection || '',
        brand: productData.brand?._id || productData.brand || '',
        categories: productData.categories?.map((category: any) => category._id || category) || [],
        colors: productData.colors || [],
        tags: productData.tags?.join(', ') || '',
        weight: productData.weight?.toString() || '',
        dimensions: {
          length: productData.dimensions?.length?.toString() || '',
          width: productData.dimensions?.width?.toString() || '',
          height: productData.dimensions?.height?.toString() || '',
        },
        isActive: productData.isActive ?? true,
        isFeatured: productData.isFeatured ?? false,
        isOnSale: productData.isOnSale ?? false,
        hasVariants: productData.hasVariants ?? (productData.variants?.length > 0),
      });
      setImages(productData.images || []);
      if (productData.hasVariants && productData.variants?.length) {
        setVariants(productData.variants.map(mapVariantToState));
      } else {
        setVariants([]);
      }
    } else if (!isEditMode) {
      setFormData({ ...defaultFormState, dimensions: { ...defaultDimensions } });
      setImages([]);
      setVariants([]);
    }
  }, [productData, isEditMode]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name.startsWith('dimensions.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [field]: value,
        },
      }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error('Collection name is required');
      return;
    }

    try {
      const response = await api.post('/collections', { name: newCollectionName });
      toast.success('Collection created successfully');
      setFormData((prev) => ({ ...prev, collection: response.data.data._id }));
      setNewCollectionName('');
      setShowNewCollection(false);
      refetchCollections();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create collection');
    }
  };

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) {
      toast.error('Brand name is required');
      return;
    }

    try {
      const response = await api.post('/brands', { name: newBrandName });
      toast.success('Brand created successfully');
      setFormData((prev) => ({ ...prev, brand: response.data.data._id }));
      setNewBrandName('');
      setShowNewBrand(false);
      refetchBrands();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create brand');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const response = await api.post('/categories', { name: newCategoryName });
      toast.success('Category created successfully');
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, response.data.data._id],
      }));
      setNewCategoryName('');
      setShowNewCategory(false);
      refetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadPromises = Array.from(files).map(async (file) => {
      const payload = new FormData();
      payload.append('file', file);

      try {
        const response = await api.post('/upload', payload);
        return response.data.data.url;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image';
        toast.error(errorMessage);
        console.error('Upload error details:', {
          message: errorMessage,
          status: error.response?.status,
          data: error.response?.data,
          file: {
            name: file.name,
            type: file.type,
            size: file.size,
          },
        });
        return null;
      }
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    const validUrls = uploadedUrls.filter((url): url is string => Boolean(url));
    setImages((prev) => [...prev, ...validUrls]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantModeChange = (hasVariants: boolean) => {
    setFormData((prev) => ({ ...prev, hasVariants }));
    if (hasVariants && variants.length === 0) {
      setVariants([createEmptyVariant()]);
    }
    if (!hasVariants) {
      setVariants([]);
    }
  };

  const handleAddVariant = () => {
    setVariants((prev) => [...prev, createEmptyVariant()]);
  };

  const handleRemoveVariant = (variantId: string) => {
    setVariants((prev) => prev.filter((variant) => variant.id !== variantId));
  };

  const handleVariantFieldChange = <K extends keyof VariantFormState>(
    variantId: string,
    field: K,
    value: VariantFormState[K]
  ) => {
    setVariants((prev) =>
      prev.map((variant) => (variant.id === variantId ? { ...variant, [field]: value } : variant))
    );
  };

  const handleVariantAttributeChange = (
    variantId: string,
    attributeId: string,
    field: 'name' | 'value',
    value: string
  ) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== variantId) return variant;
        return {
          ...variant,
          attributes: variant.attributes.map((attribute) =>
            attribute.id === attributeId ? { ...attribute, [field]: value } : attribute
          ),
        };
      })
    );
  };

  const handleVariantAttributeAdd = (variantId: string) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== variantId) return variant;
        if (variant.attributes.length >= MAX_VARIANT_ATTRIBUTES) {
          toast.error(`Maximum ${MAX_VARIANT_ATTRIBUTES} attributes per variant`);
          return variant;
        }
        return {
          ...variant,
          attributes: [
            ...variant.attributes,
            {
              id: generateId(),
              name: '',
              value: '',
            },
          ],
        };
      })
    );
  };

  const handleVariantAttributeRemove = (variantId: string, attributeId: string) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== variantId) return variant;
        const updated = variant.attributes.filter((attribute) => attribute.id !== attributeId);
        return {
          ...variant,
          attributes: updated.length > 0 ? updated : variant.attributes,
        };
      })
    );
  };

  const handleVariantImageUpload = async (variantId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;

    const file = files[0];
    const payload = new FormData();
    payload.append('file', file);

    try {
      setVariantUploads((prev) => ({ ...prev, [variantId]: true }));
      const response = await api.post('/upload', payload);
      handleVariantFieldChange(variantId, 'image', response.data.data.url);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload variant image');
    } finally {
      setVariantUploads((prev) => ({ ...prev, [variantId]: false }));
    }
  };

  const handleVariantImageRemove = (variantId: string) => {
    handleVariantFieldChange(variantId, 'image', '');
  };

  const handleAddColor = () => {
    const value = colorInput.trim();
    if (!value) {
      toast.error('Please enter a color name');
      return;
    }
    const normalizedValue = value.toLowerCase();
    if (formData.colors.some((c) => c.toLowerCase() === normalizedValue)) {
      toast.error('Color already added');
      setColorInput('');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, value],
    }));
    setColorInput('');
  };

  const handleRemoveColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((item) => item !== color),
    }));
  };

  const buildVariantOptionsPayload = () => {
    const optionMap = new Map<string, Set<string>>();

    variants.forEach((variant) => {
      variant.attributes.forEach((attribute) => {
        const name = attribute.name.trim();
        const value = attribute.value.trim();
        if (!name || !value) return;
        if (!optionMap.has(name)) {
          optionMap.set(name, new Set());
        }
        optionMap.get(name)!.add(value);
      });
    });

    return Array.from(optionMap.entries()).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }));
  };

  const formatVariantsForSubmit = () =>
    variants.map((variant) => {
      const optionValues = variant.attributes.reduce<Record<string, string>>((acc, attribute) => {
        const name = attribute.name.trim();
        const value = attribute.value.trim();
        if (name && value) {
          acc[name] = value;
        }
        return acc;
      }, {});

      return {
        title: variant.title || undefined,
        color: variant.color || undefined,
        optionValues: Object.keys(optionValues).length ? optionValues : undefined,
        price: variant.price ? parseFloat(variant.price) : undefined,
        salePrice: variant.salePrice ? parseFloat(variant.salePrice) : undefined,
        cost: variant.cost ? parseFloat(variant.cost) : undefined,
        sku: variant.sku || undefined,
        barcode: variant.barcode || undefined,
        stock: variant.stock ? parseInt(variant.stock, 10) : 0,
        lowStock: variant.lowStock ? parseInt(variant.lowStock, 10) : 0,
        weight: variant.weight ? parseFloat(variant.weight) : undefined,
        dimensions: buildDimensionsPayload(variant.dimensions),
        image: variant.image || undefined,
        images: variant.image ? [variant.image] : [],
        isActive: variant.isActive,
      };
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.hasVariants && variants.length === 0) {
      toast.error('Add at least one variant');
      return;
    }

    const invalidVariant = formData.hasVariants
      ? variants.find((variant) => !variant.price || !variant.sku)
      : null;

    if (invalidVariant) {
      toast.error('Every variant requires price and SKU');
      return;
    }

    setLoading(true);

    try {
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const payload: Record<string, any> = {
        name: formData.name,
        description: formData.description,
        sku: formData.sku || undefined,
        barcode: formData.barcode || undefined,
        colors: Array.isArray(formData.colors) && formData.colors.length > 0 
          ? formData.colors.filter((c) => c && c.trim()) 
          : undefined,
        tags,
        images,
        hasVariants: formData.hasVariants,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isOnSale: formData.isOnSale,
        collection: formData.collection || undefined,
        brand: formData.brand || undefined,
        categories: formData.categories.length ? formData.categories : undefined,
      };

      if (formData.hasVariants) {
        payload.variants = formatVariantsForSubmit();
        payload.variantOptions = buildVariantOptionsPayload();
      } else {
        payload.price = formData.price ? parseFloat(formData.price) : undefined;
        payload.salePrice = formData.salePrice ? parseFloat(formData.salePrice) : undefined;
        payload.cost = formData.cost ? parseFloat(formData.cost) : undefined;
        payload.stock = formData.stock ? parseInt(formData.stock, 10) : 0;
        payload.lowStock = formData.lowStock ? parseInt(formData.lowStock, 10) : 0;
        payload.weight = formData.weight ? parseFloat(formData.weight) : undefined;
        payload.dimensions = buildDimensionsPayload(formData.dimensions);
      }

      if (isEditMode && productId) {
        await api.put(`/products/${productId}`, payload);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', payload);
        toast.success('Product created successfully');
      }

      router.push('/dashboard/products');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${isEditMode ? 'update' : 'create'} product`
      );
    } finally {
      setLoading(false);
    }
  };

  const renderVariantAttributes = (variant: VariantFormState) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="label">Variant attributes</p>
        <button
          type="button"
          onClick={() => handleVariantAttributeAdd(variant.id)}
          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          + Add attribute
        </button>
      </div>

      {variant.attributes.map((attribute) => (
        <div key={attribute.id} className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Attribute (e.g. Size, Volume)"
            value={attribute.name}
            onChange={(event) =>
              handleVariantAttributeChange(variant.id, attribute.id, 'name', event.target.value)
            }
            className="input-field"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Value (e.g. 2 L)"
              value={attribute.value}
              onChange={(event) =>
                handleVariantAttributeChange(variant.id, attribute.id, 'value', event.target.value)
              }
              className="input-field"
            />
            {variant.attributes.length > 1 && (
              <button
                type="button"
                onClick={() => handleVariantAttributeRemove(variant.id, attribute.id)}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:text-red-500"
                aria-label="Remove attribute"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderVariants = () => (
    <div className="card p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Variants</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage each variant&apos;s pricing, inventory, shipping, and imagery.
          </p>
        </div>
        <button type="button" className="btn-primary flex items-center gap-2" onClick={handleAddVariant}>
          <Plus className="w-4 h-4" />
          Add variant
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-sm text-gray-500">
          No variants yet. Click &quot;Add variant&quot; to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {variants.map((variant, index) => {
            const variantUploading = variantUploads[variant.id];
            return (
              <div
                key={variant.id}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Variant #{index + 1}
                    </p>
                    <p className="text-sm text-gray-500">Give each variant a clear name</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={variant.isActive}
                        onChange={(event) =>
                          handleVariantFieldChange(variant.id, 'isActive', event.target.checked)
                        }
                        className="rounded"
                      />
                      Active
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(variant.id)}
                      className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Variant title</label>
                    <input
                      type="text"
                      value={variant.title}
                      onChange={(event) =>
                        handleVariantFieldChange(variant.id, 'title', event.target.value)
                      }
                      className="input-field"
                      placeholder="e.g. 2 Liter Bottle"
                    />
                  </div>
                  <div>
                    <label className="label flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Color
                    </label>
                    <input
                      type="text"
                      list={colorDataListId}
                      value={variant.color}
                      onChange={(event) =>
                        handleVariantFieldChange(variant.id, 'color', event.target.value)
                      }
                      className="input-field"
                      placeholder="e.g. Red (type or select)"
                    />
                  </div>
                </div>

                {renderVariantAttributes(variant)}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Price *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.price}
                      onChange={(event) =>
                        handleVariantFieldChange(variant.id, 'price', event.target.value)
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Sale price</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.salePrice}
                      onChange={(event) =>
                        handleVariantFieldChange(variant.id, 'salePrice', event.target.value)
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Cost per item</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.cost}
                      onChange={(event) =>
                        handleVariantFieldChange(variant.id, 'cost', event.target.value)
                      }
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">SKU *</label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(event) =>
                        handleVariantFieldChange(variant.id, 'sku', event.target.value)
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Barcode</label>
                    <input
                      type="text"
                      value={variant.barcode}
                      onChange={(event) =>
                        handleVariantFieldChange(variant.id, 'barcode', event.target.value)
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(event) =>
                        handleVariantFieldChange(variant.id, 'stock', event.target.value)
                      }
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Low stock alert</label>
                    <input
                      type="number"
                      min="0"
                      value={variant.lowStock}
                      onChange={(event) =>
                        handleVariantFieldChange(variant.id, 'lowStock', event.target.value)
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Weight (kg)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.weight}
                      onChange={(event) =>
                        handleVariantFieldChange(variant.id, 'weight', event.target.value)
                      }
                      className="input-field"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="label">L</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.dimensions.length}
                        onChange={(event) =>
                          handleVariantFieldChange(variant.id, 'dimensions', {
                            ...variant.dimensions,
                            length: event.target.value,
                          })
                        }
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label">W</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.dimensions.width}
                        onChange={(event) =>
                          handleVariantFieldChange(variant.id, 'dimensions', {
                            ...variant.dimensions,
                            width: event.target.value,
                          })
                        }
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label">H</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.dimensions.height}
                        onChange={(event) =>
                          handleVariantFieldChange(variant.id, 'dimensions', {
                            ...variant.dimensions,
                            height: event.target.value,
                          })
                        }
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label">Variant image</label>
                  {variant.image ? (
                    <div className="flex items-center gap-4">
                      <Image
                        src={variant.image}
                        alt={variant.title || `Variant ${index + 1}`}
                        width={120}
                        height={120}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleVariantImageRemove(variant.id)}
                        className="btn-secondary px-3 py-2 text-sm"
                      >
                        Remove image
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500">
                      {variantUploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-gray-400" />
                          <span className="text-sm text-gray-500">Upload image</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleVariantImageUpload(variant.id, event)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (isEditMode && productLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading product...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/products"
          className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {isEditMode ? 'Update product details' : 'Create a new product for your store'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Product type
                </p>
                <p className="text-sm text-gray-500">
                  Switch to variants when a product has multiple options.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => handleVariantModeChange(false)}
                  className={`rounded-lg px-3 py-1 text-sm font-medium ${
                    !formData.hasVariants
                      ? 'bg-white text-gray-900 shadow dark:bg-gray-900 dark:text-white'
                      : 'text-gray-500'
                  }`}
                >
                  Single product
                </button>
                <button
                  type="button"
                  onClick={() => handleVariantModeChange(true)}
                  className={`rounded-lg px-3 py-1 text-sm font-medium ${
                    formData.hasVariants
                      ? 'bg-white text-gray-900 shadow dark:bg-gray-900 dark:text-white'
                      : 'text-gray-500'
                  }`}
                >
                  Variant product
                </button>
              </div>
            </div>
          </div>

          <div className="card p-4 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic information</h2>

            <div>
              <label className="label">Product name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="input-field"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Colors
                </label>
                <span className="text-xs text-gray-500">Press Enter to add each color</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    list="color-options"
                    value={colorInput}
                    onChange={(event) => setColorInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleAddColor();
                      }
                    }}
                    className="input-field w-full"
                    placeholder="e.g. Red (type or select from list)"
                  />
                  <datalist id="color-options">
                    {commonColors.map((color) => (
                      <option key={color} value={color} />
                    ))}
                  </datalist>
                </div>
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="btn-secondary flex items-center gap-2 px-4"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
              {formData.colors.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.colors.map((color) => (
                    <span
                      key={color}
                      className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    >
                      {color}
                      <button type="button" onClick={() => handleRemoveColor(color)} aria-label="Remove color">
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!formData.hasVariants && (
            <>
              <div className="card p-4 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pricing</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="label">Price *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="input-field"
                      required={!formData.hasVariants}
                    />
                  </div>
                  <div>
                    <label className="label">Sale price</label>
                    <input
                      type="number"
                      name="salePrice"
                      value={formData.salePrice}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Cost per item</label>
                    <input
                      type="number"
                      name="cost"
                      value={formData.cost}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              <div className="card p-4 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Inventory</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="label">SKU</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="input-field"
                      required={!formData.hasVariants}
                    />
                  </div>
                  <div>
                    <label className="label">Barcode</label>
                    <input
                      type="text"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Stock quantity *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      className="input-field"
                      required={!formData.hasVariants}
                    />
                  </div>
                  <div>
                    <label className="label">Low stock alert</label>
                    <input
                      type="number"
                      name="lowStock"
                      value={formData.lowStock}
                      onChange={handleInputChange}
                      min="0"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              <div className="card p-4 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Shipping</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div>
                    <label className="label">Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Length (cm)</label>
                    <input
                      type="number"
                      name="dimensions.length"
                      value={formData.dimensions.length}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Width (cm)</label>
                    <input
                      type="number"
                      name="dimensions.width"
                      value={formData.dimensions.width}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Height (cm)</label>
                    <input
                      type="number"
                      name="dimensions.height"
                      value={formData.dimensions.height}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {formData.hasVariants && renderVariants()}

          <div className="card p-4 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Product images</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {images.map((image, index) => (
                <div key={`${image}-${index}`} className="group relative">
                  <Image
                    src={image}
                    alt={`Product ${index + 1}`}
                    width={200}
                    height={200}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-primary-500 dark:border-gray-600">
                <Upload className="mb-2 h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500">Upload image</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Collection (main)</h2>
            <div>
              <select
                name="collection"
                value={formData.collection}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Select collection</option>
                {collectionsData?.collections?.map((collection: any) => (
                  <option key={collection._id} value={collection._id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>
            {!showNewCollection ? (
              <button
                type="button"
                onClick={() => setShowNewCollection(true)}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                + Create new collection
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Collection name"
                  value={newCollectionName}
                  onChange={(event) => setNewCollectionName(event.target.value)}
                  className="input-field"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={handleCreateCollection} className="btn-primary px-3 py-1 text-sm">
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCollection(false);
                      setNewCollectionName('');
                    }}
                    className="btn-secondary px-3 py-1 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="card p-4 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Brand</h2>
            <div>
              <select name="brand" value={formData.brand} onChange={handleInputChange} className="input-field">
                <option value="">Select brand</option>
                {brandsData?.brands?.map((brand: any) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            {!showNewBrand ? (
              <button
                type="button"
                onClick={() => setShowNewBrand(true)}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                + Create new brand
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Brand name"
                  value={newBrandName}
                  onChange={(event) => setNewBrandName(event.target.value)}
                  className="input-field"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={handleCreateBrand} className="btn-primary px-3 py-1 text-sm">
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewBrand(false);
                      setNewBrandName('');
                    }}
                    className="btn-secondary px-3 py-1 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="card p-4 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Categories</h2>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {categoriesData?.categories?.map((category: any) => (
                <label key={category._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category._id)}
                    onChange={() => handleCategoryToggle(category._id)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                </label>
              ))}
            </div>
            {!showNewCategory ? (
              <button
                type="button"
                onClick={() => setShowNewCategory(true)}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                + Create new category
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  className="input-field"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={handleCreateCategory} className="btn-primary px-3 py-1 text-sm">
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategory(false);
                      setNewCategoryName('');
                    }}
                    className="btn-secondary px-3 py-1 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="card p-4 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tags</h2>
            <div>
              <label className="label">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g. summer, sale, trending"
                className="input-field"
              />
            </div>
          </div>

          <div className="card p-4 space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Status</h2>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Featured product</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isOnSale"
                checked={formData.isOnSale}
                onChange={handleInputChange}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Mark as on sale</span>
            </label>
          </div>

          <div className="card p-4 space-y-4">
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (isEditMode ? 'Updating...' : 'Creating...') : isEditMode ? 'Update product' : 'Create product'}
            </button>
            <Link href="/dashboard/products" className="btn-secondary w-full text-center">
              Cancel
            </Link>
          </div>
        </div>
      </form>

      <datalist id={colorDataListId}>
        {commonColors.map((color) => (
          <option key={color} value={color} />
        ))}
        {formData.colors.map((color) => (
          <option key={`product-${color}`} value={color} />
        ))}
      </datalist>
    </div>
  );
}


