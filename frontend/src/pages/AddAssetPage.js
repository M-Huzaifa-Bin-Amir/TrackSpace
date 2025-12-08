// src/pages/AddAssetPage.js
import React, { useState } from "react";
import { createAssetApi } from "../services/assetsApi";

const AddAssetPage = ({ setCurrentPage, user }) => {
  const [form, setForm] = useState({
    serialNo: "",
    model: "",
    assetSubtype: "Hardware", // Hardware | Software
    status: "Available",
    purchaseDate: "",
    cost: "",
    category: "",
    vendor: "",
    location: "",
  });

  // Nested hardware details
  const [hardware, setHardware] = useState({
    cpu: "",
    ram: "",
    storage: "",
    gpu: "",
    motherboard: "",
    peripherals: "", // comma-separated, we’ll split into array
  });

  // Nested software details
  const [software, setSoftware] = useState({
    title: "",
    version: "",
    publisher: "",
    licenseKey: "",
    installedLocation: "",
    expiryDate: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleHardwareChange = (field, value) => {
    setHardware((prev) => ({ ...prev, [field]: value }));
  };

  const handleSoftwareChange = (field, value) => {
    setSoftware((prev) => ({ ...prev, [field]: value }));
  };

  // Client-side validation (top-level + nested)
  const validate = () => {
    const errors = {};

    if (!form.serialNo.trim()) {
      errors.serialNo = "Serial number is required";
    }
    if (!form.assetSubtype) {
      errors.assetSubtype = "Asset subtype is required";
    }
    if (!form.status) {
      errors.status = "Status is required";
    }
    if (!form.category.trim()) {
      errors.category = "Category is required";
    }
    if (!form.location.trim()) {
      errors.location = "Location is required";
    }

    if (form.cost && isNaN(Number(form.cost))) {
      errors.cost = "Cost must be a number";
    }

    // Subtype-specific validation
    if (form.assetSubtype === "Hardware") {
      if (!hardware.cpu.trim()) {
        errors.hardwareCpu = "CPU is required for hardware assets";
      }
      if (!hardware.ram.trim()) {
        errors.hardwareRam = "RAM is required for hardware assets";
      }
    }

    if (form.assetSubtype === "Software") {
      if (!software.title.trim()) {
        errors.softwareTitle = "Title is required for software assets";
      }
      if (!software.licenseKey.trim()) {
        errors.softwareLicenseKey = "License key is required";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const formData = new FormData();

      // Top-level fields
      Object.entries(form).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      // Nested hardware / software
      if (form.assetSubtype === "Hardware") {
        const peripheralsArray = hardware.peripherals
          ? hardware.peripherals
              .split(",")
              .map((p) => p.trim())
              .filter(Boolean)
          : [];

        const hardwarePayload = {
          cpu: hardware.cpu || undefined,
          ram: hardware.ram || undefined,
          storage: hardware.storage || undefined,
          gpu: hardware.gpu || undefined,
          motherboard: hardware.motherboard || undefined,
          peripherals: peripheralsArray,
        };

        formData.append("hardware", JSON.stringify(hardwarePayload));
      }

      if (form.assetSubtype === "Software") {
        const softwarePayload = {
          title: software.title || undefined,
          version: software.version || undefined,
          publisher: software.publisher || undefined,
          licenseKey: software.licenseKey || undefined,
          installedLocation: software.installedLocation || undefined,
          // expiryDate will be a string YYYY-MM-DD; backend/Mongoose will cast to Date
          expiryDate: software.expiryDate || undefined,
        };

        formData.append("software", JSON.stringify(softwarePayload));
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await createAssetApi(formData);

      alert(`Asset "${form.serialNo}" added successfully!`);
      setCurrentPage("assets");
    } catch (err) {
      console.error("Failed to save asset:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save asset";
      setGeneralError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Extra safety: guard non-admins
  if (!user || user.role !== "admin") {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#340158] mb-4">
          Not authorized
        </h1>
        <p className="text-gray-600">
          Only administrators are allowed to add new assets.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-[#340158] mb-6">
        Add New Asset
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg flex flex-col gap-5"
      >
        {generalError && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg text-sm">
            {generalError}
          </div>
        )}

        {/* Serial No */}
        <div>
          <label className="font-semibold text-gray-700 mb-1 block">
            Serial Number *
          </label>
          <input
            required
            className="w-full border border-purple-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
            placeholder="e.g. SRV-00123"
            value={form.serialNo}
            onChange={(e) => handleChange("serialNo", e.target.value)}
          />
          {fieldErrors.serialNo && (
            <p className="text-red-500 text-xs mt-1">
              {fieldErrors.serialNo}
            </p>
          )}
        </div>

        {/* Model */}
        <div>
          <label className="font-semibold text-gray-700 mb-1 block">
            Model
          </label>
          <input
            className="w-full border border-purple-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
            placeholder="e.g. Dell Latitude 5520 / Windows 11 Pro"
            value={form.model}
            onChange={(e) => handleChange("model", e.target.value)}
          />
        </div>

        {/* Subtype + Category */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="font-semibold text-gray-700 mb-1 block">
              Asset Subtype *
            </label>
            <select
              className="w-full border border-purple-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
              value={form.assetSubtype}
              onChange={(e) =>
                handleChange("assetSubtype", e.target.value)
              }
            >
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
            </select>
            {fieldErrors.assetSubtype && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.assetSubtype}
              </p>
            )}
          </div>
          <div className="flex-1">
            <label className="font-semibold text-gray-700 mb-1 block">
              Category *
            </label>
            <input
              className="w-full border border-purple-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
              placeholder="e.g. Laptop, Server, License"
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
            />
            {fieldErrors.category && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.category}
              </p>
            )}
          </div>
        </div>

        {/* Status + Purchase Date */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="font-semibold text-gray-700 mb-1 block">
              Status *
            </label>
            <select
              className="w-full border border-purple-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="Available">Available</option>
              <option value="Assigned">Assigned</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
            {fieldErrors.status && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.status}
              </p>
            )}
          </div>
          <div className="flex-1">
            <label className="font-semibold text-gray-700 mb-1 block">
              Purchase Date
            </label>
            <input
              type="date"
              className="w-full border border-purple-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
              value={form.purchaseDate}
              onChange={(e) =>
                handleChange("purchaseDate", e.target.value)
              }
            />
          </div>
        </div>

        {/* Cost + Vendor */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="font-semibold text-gray-700 mb-1 block">
              Cost
            </label>
            <input
              className="w-full border border-purple-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
              placeholder="e.g. 120000"
              value={form.cost}
              onChange={(e) => handleChange("cost", e.target.value)}
            />
            {fieldErrors.cost && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.cost}
              </p>
            )}
          </div>
          <div className="flex-1">
            <label className="font-semibold text-gray-700 mb-1 block">
              Vendor
            </label>
            <input
              className="w-full border border-purple-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
              placeholder="e.g. MegaTech Suppliers"
              value={form.vendor}
              onChange={(e) => handleChange("vendor", e.target.value)}
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="font-semibold text-gray-700 mb-1 block">
            Location *
          </label>
          <input
            required
            className="w-full border border-purple-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
            placeholder="e.g. GIKI Lab 3, Warehouse A"
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
          />
          {fieldErrors.location && (
            <p className="text-red-500 text-xs mt-1">
              {fieldErrors.location}
            </p>
          )}
        </div>

        {/* ==== Hardware Details ==== */}
        {form.assetSubtype === "Hardware" && (
          <div className="border border-purple-100 rounded-xl p-4 bg-purple-50/40">
            <h2 className="font-semibold text-[#340158] mb-3">
              Hardware Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  CPU *
                </label>
                <input
                  className="w-full border border-purple-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
                  placeholder="e.g. Intel i7-12700H"
                  value={hardware.cpu}
                  onChange={(e) =>
                    handleHardwareChange("cpu", e.target.value)
                  }
                />
                {fieldErrors.hardwareCpu && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.hardwareCpu}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  RAM *
                </label>
                <input
                  className="w-full border border-purple-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
                  placeholder="e.g. 16GB DDR4"
                  value={hardware.ram}
                  onChange={(e) =>
                    handleHardwareChange("ram", e.target.value)
                  }
                />
                {fieldErrors.hardwareRam && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.hardwareRam}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Storage
                </label>
                <input
                  className="w-full border border-purple-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
                  placeholder="e.g. 512GB SSD"
                  value={hardware.storage}
                  onChange={(e) =>
                    handleHardwareChange("storage", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  GPU
                </label>
                <input
                  className="w-full border border-purple-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
                  placeholder="e.g. RTX 3060"
                  value={hardware.gpu}
                  onChange={(e) =>
                    handleHardwareChange("gpu", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Motherboard
                </label>
                <input
                  className="w-full border border-purple-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
                  placeholder="e.g. ASUS Prime B660"
                  value={hardware.motherboard}
                  onChange={(e) =>
                    handleHardwareChange("motherboard", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Peripherals (comma-separated)
                </label>
                <input
                  className="w-full border border-purple-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
                  placeholder="e.g. Mouse, Keyboard, Headset"
                  value={hardware.peripherals}
                  onChange={(e) =>
                    handleHardwareChange("peripherals", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* ==== Software Details ==== */}
        {form.assetSubtype === "Software" && (
          <div className="border border-purple-100 rounded-xl p-4 bg-indigo-50/40">
            <h2 className="font-semibold text-[#340158] mb-3">
              Software Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Title *
                </label>
                <input
                  className="w-full border border-purple-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
                  placeholder="e.g. Windows 11 Pro"
                  value={software.title}
                  onChange={(e) =>
                    handleSoftwareChange("title", e.target.value)
                  }
                />
                {fieldErrors.softwareTitle && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.softwareTitle}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Version
                </label>
                <input
                  className="w-full border border-purple-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
                  placeholder="e.g. 22H2"
                  value={software.version}
                  onChange={(e) =>
                    handleSoftwareChange("version", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Publisher
                </label>
                <input
                  className="w-full border border-purple-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
                  placeholder="e.g. Microsoft"
                  value={software.publisher}
                  onChange={(e) =>
                    handleSoftwareChange("publisher", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  License Key *
                </label>
                <input
                  className="w-full border border-purple-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
                  placeholder="e.g. XXXX-XXXX-XXXX-XXXX"
                  value={software.licenseKey}
                  onChange={(e) =>
                    handleSoftwareChange("licenseKey", e.target.value)
                  }
                />
                {fieldErrors.softwareLicenseKey && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.softwareLicenseKey}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Installed Location
                </label>
                <input
                  className="w-full border border-purple-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
                  placeholder="e.g. Lab 1 PCs, Server A"
                  value={software.installedLocation}
                  onChange={(e) =>
                    handleSoftwareChange(
                      "installedLocation",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Expiry Date
                </label>
                <input
                  type="date"
                  className="w-full border border-purple-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
                  value={software.expiryDate}
                  onChange={(e) =>
                    handleSoftwareChange("expiryDate", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Image upload */}
        <div>
          <label className="font-semibold text-gray-700 mb-1 block">
            Asset Image (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#4B0082] hover:bg-[#340158] text-white py-3 rounded-lg font-bold transition disabled:opacity-50 shadow-md"
          >
            {loading ? "Saving..." : "Save Asset"}
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage("assets")}
            className="px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAssetPage;
