"use client";
import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { RecipeTableWithSEO } from "@/components/recipe-table/RecipeTableWithSEO";
import { RecipeModal } from "@/components/dashboard/RecipeModal";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import ContentManagementCards from "@/components/admin/ContentManagementCards";
import GenericContentEditor from "@/components/admin/GenericContentEditor";
import HomeContentEditor from "@/components/admin/HomeContentEditor";
import SiteSettingsEditor from "@/components/admin/SiteSettingsEditor";
import AboutContentEditor from "@/components/admin/AboutContentEditor";
import ContactContentEditor from "@/components/admin/ContactContentEditor";
import FAQContentManager from "@/components/admin/FAQContentManager";
import SocialMediaManager from "@/components/admin/SocialMediaManager";
import PrivacyPolicyCMS from "@/components/admin/PrivacyPolicyCMS";
import DisclaimerPolicyCMS from "@/components/admin/DisclaimerPolicyCMS";
import TermsPolicyCMS from "@/components/admin/TermsPolicyCMS";
import CookiesPolicyCMS from "@/components/admin/CookiesPolicyCMS";
import Settings from "@/components/admin/Settings";
import AIPlugin from "@/components/admin/AIPlugin";
import AuthorManagement from "@/components/admin/authors/AuthorManagement";
import ProfileSettings from "@/components/admin/ProfileSettings";
import ApiTokenManager from "@/components/admin/ApiTokenManager";
import BackupManager from "@/components/admin/BackupManager";
import SEOReportsView from "@/components/admin/SEOReportsView";
import GoogleSearchSettings from "@/components/admin/GoogleSearchSettings";
import CategoryManager from "@/components/admin/CategoryManager";
import HeroSlidesManager from "@/components/admin/HeroSlidesManager";
import PinterestSpyManager from "@/automation/pinterest/PinterestSpyManager";
import ImageGenerationManager from "@/automation/image-generation/ImageGenerationManager";
import RecipeGenerationManager from '@/automation/recipe-generation/RecipeGenerationManager';
import ScheduleManager from '@/components/automation/ScheduleManager';
import PipelineReportsPage from '@/app/admin/automation/reports/page';
import SEOResultsPage from '@/app/admin/automation/seo-results/page';
import AutomationSettingsPage from '@/app/admin/automation/settings/page';
import AutomationHelpPage from '@/app/admin/automation/help/page';
import PinterestBoardsPage from '@/app/admin/automation/pinterest-boards/page';
import GTMSettingsPage from '@/app/admin/gtm-settings/page';
import { Recipe } from "@/outils/types";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";

function AdminDashboardContent() {
  const { state, openCreateModal, openEditModal, closeModal, deleteRecipe } =
    useAdmin();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleAddRecipe = () => {
    openCreateModal();
  };

  const handleEditRecipe = (recipe: Recipe) => {
    openEditModal(recipe);
  };

  const handleDeleteRecipe = async (id: string) => {
    await deleteRecipe(id);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <Dashboard recipes={state.recipes} onEditRecipe={handleEditRecipe} />
        );
      case "recipes":
        return (
          <RecipeTableWithSEO
            recipes={state.recipes}
            onEdit={handleEditRecipe}
            onDelete={handleDeleteRecipe}
            onAdd={handleAddRecipe}
          />
        );
      case "categories":
        return <CategoryManager />;
      case "authors":
        return <AuthorManagement />;
      case "hero-slides":
        return <HeroSlidesManager />;
      case "media":
        return (
          <div className="space-y-6">
            <MediaLibrary />
          </div>
        );
      case "content":
        return (
          <div className="space-y-6">
            <ContentManagementCards onSectionChange={setActiveSection} />
          </div>
        );
      case "content-site":
        return (
          <SiteSettingsEditor
            onBack={() => setActiveSection("content")}
          />
        );
      case "content-home":
        return <HomeContentEditor onBack={() => setActiveSection("content")} />;
      case "content-social":
        return <SocialMediaManager onBack={() => setActiveSection("content")} />;
      case "content-about":
        return <AboutContentEditor onBack={() => setActiveSection("content")} />;
      case "content-contact":
        return <ContactContentEditor onBack={() => setActiveSection("content")} />;
      case "content-privacy":
        return <PrivacyPolicyCMS onBack={() => setActiveSection("content")} />;
      case "content-terms":
        return <TermsPolicyCMS onBack={() => setActiveSection("content")} />;
      case "content-faq":
        return <FAQContentManager onBack={() => setActiveSection("content")} />;
      case "content-disclaimer":
        return <DisclaimerPolicyCMS onBack={() => setActiveSection("content")} />;
      case "content-cookies":
        return <CookiesPolicyCMS onBack={() => setActiveSection("content")} />;
      case "backup":
        return <BackupManager />;
      case "pinterest-spy":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Pinterest Spy Data Manager
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Import Pinterest spy data and generate recipes with AI-powered SEO extraction
              </p>
            </div>
            <PinterestSpyManager />
          </div>
        );
      case "image-generation":
        return <ImageGenerationManager />;
      case "recipe-generation":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Recipe Generation
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Generate complete recipes from entries with SEO data and AI-generated images
              </p>
            </div>
            <RecipeGenerationManager />
          </div>
        );
      case "pipeline-schedules":
        return <ScheduleManager />;
      case "seo-results":
        return (
          <div className="space-y-6">
            <SEOResultsPage />
          </div>
        );
      case "automation-settings":
        return (
          <div className="space-y-6">
            <AutomationSettingsPage />
          </div>
        );
      case "automation-help":
        return (
          <div className="space-y-6">
            <AutomationHelpPage />
          </div>
        );
      case "pinterest-boards":
        return (
          <div className="space-y-6">
            <PinterestBoardsPage />
          </div>
        );
      case "reports":
        return (
          <div className="space-y-6">
            <PipelineReportsPage />
          </div>
        );
      case "seo-reports":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                AI SEO Reports
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                View and manage AI-generated SEO enhancements for your recipes
              </p>
            </div>
            <SEOReportsView />
          </div>
        );
      case "google-search":
        return <GoogleSearchSettings />;
      case "plugins":
        return <AIPlugin />;
      case "api-tokens":
        return <ApiTokenManager />;
      case "settings":
        return <Settings />;
      case "gtm-settings":
        return <GTMSettingsPage />;
      case "profile":
        return <ProfileSettings />;
      default:
        return (
          <Dashboard recipes={state.recipes} onEditRecipe={handleEditRecipe} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex relative">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onAddRecipe={handleAddRecipe}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={toggleMobileSidebar}
      />

      <main className="flex-1 overflow-auto min-h-screen">
        {/* Mobile Header */}
        <div className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Admin Dashboard</h1>
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
          {renderContent()}
        </div>
      </main>

      <RecipeModal
        key={`${state.modalMode}-${Date.now()}`}
        isOpen={state.isModalOpen}
        onClose={closeModal}
        recipe={state.selectedRecipe}
        mode={state.modalMode === "create" ? "add" : "edit"}
      />
    </div>
  );
}

function AdminDashboard() {
  return (
    <AdminProvider>
      <AdminDashboardContent />
    </AdminProvider>
  );
}

export default AdminDashboard;
