'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import Image from 'next/image';
import { storage, auth, database } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, push, set } from 'firebase/database';
import { useRouter } from 'next/navigation';

const listingSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters long'),
  propertyType: z.enum(['apartment', 'house', 'studio', 'other']),
  bedrooms: z.number().min(1).max(20),
  bathrooms: z.number().min(1).max(10),
  floorNumber: z.number().min(0).max(100).optional(),
  totalArea: z.number().min(1).max(10000),
  description: z.string().min(50, 'Description must be at least 50 characters long'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  amenities: z.array(z.string()).min(1, 'Select at least one amenity'),
  houseRules: z.string().optional(),
  rentPrice: z.number().min(1, 'Rent price must be greater than 0'),
  isRentInclusive: z.boolean(),
});

type ListingFormData = z.infer<typeof listingSchema>;

const amenitiesList = [
  "Wi-Fi", "TV", "Kitchen", "Washer", "Free parking", "Air conditioning", "Heating",
  "Dedicated workspace", "Pool", "Hot tub", "Patio", "BBQ grill", "Fire pit",
  "Gym", "Beach access", "Ski-in/Ski-out"
];

export default function ListYourHousePage() {
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      propertyType: 'apartment',
      bedrooms: 1,
      bathrooms: 1,
      floorNumber: 0,
      totalArea: 50,
      description: '',
      address: '',
      city: '',
      country: '',
      postalCode: '',
      amenities: [],
      houseRules: '',
      rentPrice: 0,
      isRentInclusive: false,
    },
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      if (images.length + newImages.length > 10) {
        setError('You can upload a maximum of 10 images.');
        return;
      }
      setImages((prevImages) => [...prevImages, ...newImages]);
      
      newImages.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrls((prevUrls) => [...prevUrls, reader.result as string]);
        };
        reader.onerror = () => {
          setError('Error reading image file. Please try again.');
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const onSubmit = async (data: ListingFormData) => {
    setIsSubmitting(true);
    setError(null);

    if (!isOnline) {
      setError('You are currently offline. Please check your internet connection and try again.');
      setIsSubmitting(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (images.length === 0) {
        throw new Error('Please upload at least one image of your property.');
      }

      // Upload images to Firebase Storage
      const imageUploadPromises = images.map(async (image, index) => {
        try {
          const storageRef = ref(storage, `listings/${user.uid}/${Date.now()}_${index}_${image.name}`);
          await uploadBytes(storageRef, image);
          return getDownloadURL(storageRef);
        } catch (error) {
          console.error(`Error uploading image ${index}:`, error);
          throw new Error(`Failed to upload image ${index}. Please try again.`);
        }
      });

      const uploadedImageUrls = await Promise.all(imageUploadPromises);

      // Add listing to Realtime Database
      const listingData = {
        ...data,
        images: uploadedImageUrls,
        createdAt: new Date().toISOString(),
        userId: user.uid,
      };

      const newListingRef = push(dbRef(database, 'listings'));
      await set(newListingRef, listingData);

      console.log('Listing created successfully with ID:', newListingRef.key);
      alert('Listing created successfully!');
      form.reset();
      setImages([]);
      setImageUrls([]);
      router.push('/profile'); // Redirect to profile or listings page
    } catch (error) {
      console.error('Error creating listing:', error);
      if (error instanceof Error) {
        setError(`Failed to create listing: ${error.message}`);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOnline) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">You are currently offline</h1>
        <p>Please check your internet connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">List Your House for Swap</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bedrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Bedrooms</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bathrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Bathrooms</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="floorNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Floor Number (optional)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="totalArea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Area (in square meters)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={5} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="amenities"
            render={() => (
              <FormItem>
                <FormLabel>Amenities</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {amenitiesList.map((amenity) => (
                    <FormField
                      key={amenity}
                      control={form.control}
                      name="amenities"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={amenity}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(amenity)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, amenity])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== amenity
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {amenity}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="houseRules"
            render={({ field }) => (
              <FormItem>
                <FormLabel>House Rules (optional)</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rentPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Rent (in local currency)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isRentInclusive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Rent is inclusive of utilities and other charges
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <div>
            <FormLabel>Property Images (Max 10)</FormLabel>
            <div className="mt-2 flex items-center">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                disabled={images.length >= 10}
              >
                {images.length >= 10 ? 'Max images reached' : 'Upload Images'}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                multiple
                accept="image/*"
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {images.length}/10 images uploaded
            </p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <Image
                    src={url}
                    alt={`Uploaded image ${index + 1}`}
                    width={200}
                    height={200}
                    className="rounded-md object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImages(images.filter((_, i) => i !== index));
                      setImageUrls(imageUrls.filter((_, i) => i !== index));
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Listing'}
          </Button>
        </form>
      </Form>
    </div>
  );
}