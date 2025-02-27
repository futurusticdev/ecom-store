"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StoreData {
  storeName: string;
  storeEmail: string;
  phoneNumber: string;
  currency: string;
  streetAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  logoUrl: string | null;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [storeData, setStoreData] = useState<StoreData>({
    storeName: "",
    storeEmail: "",
    phoneNumber: "",
    currency: "",
    streetAddress: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "",
    logoUrl: null,
  });

  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // For form validation
  const [errors, setErrors] = useState<
    Partial<Record<keyof StoreData, string>>
  >({});

  // Fetch settings data on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (!response.ok) {
          throw new Error("Failed to fetch settings");
        }
        const data = await response.json();
        setStoreData(data);
        if (data.logoUrl) {
          setLogoPreview(data.logoUrl);
        } else {
          // Set a default logo for demonstration
          setLogoPreview("https://picsum.photos/id/237/200/200");
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof StoreData, string>> = {};

    if (!storeData.storeName.trim()) {
      newErrors.storeName = "Store name is required";
    }

    if (!storeData.storeEmail.trim()) {
      newErrors.storeEmail = "Store email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(storeData.storeEmail)) {
      newErrors.storeEmail = "Please enter a valid email address";
    }

    if (!storeData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (!storeData.currency) {
      newErrors.currency = "Currency is required";
    }

    if (!storeData.streetAddress.trim()) {
      newErrors.streetAddress = "Street address is required";
    }

    if (!storeData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!storeData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    }

    if (!storeData.country) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStoreData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name as keyof StoreData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setStoreData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user selects
    if (errors[name as keyof StoreData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Logo file size must be less than 2MB",
          variant: "destructive",
        });
        return;
      }

      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    setStoreData((prev) => ({
      ...prev,
      logoUrl: null,
    }));
  };

  const handleSaveChanges = async () => {
    // Validate form before submitting
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // In a real app, you would upload the logo file to a storage service
      // and get a URL back to store in the database
      let logoUrl = storeData.logoUrl;
      if (logo) {
        // Mock logo upload - in a real app, this would be an actual upload
        logoUrl = logoPreview; // Using the preview URL as a placeholder
      }

      const updatedData = {
        ...storeData,
        logoUrl,
      };

      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      // Get the updated data from the response
      const result = await response.json();

      // Update the local state with the data from the server
      if (result.data) {
        setStoreData(result.data);
      }

      toast({
        title: "Settings saved",
        description: "Your store settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original data
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        <div className="text-sm font-medium text-center">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <a
                href="#"
                className="inline-block p-4 border-b-2 border-primary text-primary"
              >
                General
              </a>
            </li>
            <li className="mr-2">
              <a
                href="#"
                className="inline-block p-4 text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
              >
                Store
              </a>
            </li>
            <li className="mr-2">
              <a
                href="#"
                className="inline-block p-4 text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
              >
                Shipping
              </a>
            </li>
            <li className="mr-2">
              <a
                href="#"
                className="inline-block p-4 text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
              >
                Payment
              </a>
            </li>
            <li className="mr-2">
              <a
                href="#"
                className="inline-block p-4 text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
              >
                Team
              </a>
            </li>
            <li className="mr-2">
              <a
                href="#"
                className="inline-block p-4 text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
              >
                Notifications
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* General Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage your store's general settings and preferences
          </p>
        </CardHeader>
      </Card>

      {/* Store Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Store Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="storeName" className="text-sm font-medium">
                Store Name
              </label>
              <Input
                id="storeName"
                name="storeName"
                value={storeData.storeName}
                onChange={handleInputChange}
                className={errors.storeName ? "border-red-500" : ""}
              />
              {errors.storeName && (
                <p className="text-xs text-red-500 mt-1">{errors.storeName}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="storeEmail" className="text-sm font-medium">
                Store Email
              </label>
              <Input
                id="storeEmail"
                name="storeEmail"
                type="email"
                value={storeData.storeEmail}
                onChange={handleInputChange}
                className={errors.storeEmail ? "border-red-500" : ""}
              />
              {errors.storeEmail && (
                <p className="text-xs text-red-500 mt-1">{errors.storeEmail}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-sm font-medium">
                Phone Number
              </label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={storeData.phoneNumber}
                onChange={handleInputChange}
                className={errors.phoneNumber ? "border-red-500" : ""}
              />
              {errors.phoneNumber && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="currency" className="text-sm font-medium">
                Currency
              </label>
              <Select
                value={storeData.currency}
                onValueChange={(value) => handleSelectChange("currency", value)}
              >
                <SelectTrigger
                  className={errors.currency ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD ($)">USD ($)</SelectItem>
                  <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                  <SelectItem value="GBP (£)">GBP (£)</SelectItem>
                  <SelectItem value="JPY (¥)">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
              {errors.currency && (
                <p className="text-xs text-red-500 mt-1">{errors.currency}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Address Section */}
      <Card>
        <CardHeader>
          <CardTitle>Store Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="streetAddress" className="text-sm font-medium">
                Street Address
              </label>
              <Input
                id="streetAddress"
                name="streetAddress"
                value={storeData.streetAddress}
                onChange={handleInputChange}
                className={errors.streetAddress ? "border-red-500" : ""}
              />
              {errors.streetAddress && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.streetAddress}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-medium">
                City
              </label>
              <Input
                id="city"
                name="city"
                value={storeData.city}
                onChange={handleInputChange}
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && (
                <p className="text-xs text-red-500 mt-1">{errors.city}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="stateProvince" className="text-sm font-medium">
                State/Province
              </label>
              <Input
                id="stateProvince"
                name="stateProvince"
                value={storeData.stateProvince}
                onChange={handleInputChange}
                className={errors.stateProvince ? "border-red-500" : ""}
              />
              {errors.stateProvince && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.stateProvince}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="postalCode" className="text-sm font-medium">
                Postal Code
              </label>
              <Input
                id="postalCode"
                name="postalCode"
                value={storeData.postalCode}
                onChange={handleInputChange}
                className={errors.postalCode ? "border-red-500" : ""}
              />
              {errors.postalCode && (
                <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="country" className="text-sm font-medium">
                Country
              </label>
              <Select
                value={storeData.country}
                onValueChange={(value) => handleSelectChange("country", value)}
              >
                <SelectTrigger
                  className={errors.country ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="text-xs text-red-500 mt-1">{errors.country}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Branding Section */}
      <Card>
        <CardHeader>
          <CardTitle>Store Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-medium">Store Logo</label>
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="Store logo preview"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-500">
                      Logo
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("logo-upload")?.click()
                    }
                  >
                    Change Logo
                  </Button>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveLogo}
                  >
                    Remove
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended size: 512×512px. Max file size: 2MB.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Changes Button */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
