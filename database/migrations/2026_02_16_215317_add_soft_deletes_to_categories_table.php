<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            // Add soft deletes if column doesn't exist
            if (!Schema::hasColumn('categories', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // Add indexes only if they don't exist
        $this->createIndexIfNotExists('categories', 'parent_id', 'categories_parent_id_index');
        $this->createIndexIfNotExists('categories', 'slug', 'categories_slug_index');
        $this->createCompositeIndexIfNotExists('categories', ['is_featured', 'order'], 'categories_is_featured_order_index');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            if (Schema::hasColumn('categories', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });

        // Drop indexes if they exist
        $this->dropIndexIfExists('categories', 'categories_parent_id_index');
        $this->dropIndexIfExists('categories', 'categories_slug_index');
        $this->dropIndexIfExists('categories', 'categories_is_featured_order_index');
    }

    /**
     * Create index if it doesn't already exist
     */
    private function createIndexIfNotExists(string $table, string $column, string $indexName): void
    {
        if (!$this->indexExists($table, $indexName)) {
            Schema::table($table, function (Blueprint $table) use ($column) {
                $table->index($column);
            });
        }
    }

    /**
     * Create composite index if it doesn't already exist
     */
    private function createCompositeIndexIfNotExists(string $table, array $columns, string $indexName): void
    {
        if (!$this->indexExists($table, $indexName)) {
            Schema::table($table, function (Blueprint $table) use ($columns) {
                $table->index($columns);
            });
        }
    }

    /**
     * Drop index if it exists
     */
    private function dropIndexIfExists(string $table, string $indexName): void
    {
        if ($this->indexExists($table, $indexName)) {
            Schema::table($table, function (Blueprint $table) use ($indexName) {
                $table->dropIndex($indexName);
            });
        }
    }

    /**
     * Check if an index exists
     */
    private function indexExists(string $table, string $indexName): bool
    {
        $connection = Schema::getConnection();
        $databaseName = $connection->getDatabaseName();
        
        // For SQLite
        if ($connection->getDriverName() === 'sqlite') {
            $indexes = DB::select("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name=? AND name=?", [$table, $indexName]);
            return count($indexes) > 0;
        }
        
        // For MySQL
        if ($connection->getDriverName() === 'mysql') {
            $indexes = DB::select("SHOW INDEX FROM {$table} WHERE Key_name = ?", [$indexName]);
            return count($indexes) > 0;
        }
        
        // For PostgreSQL
        if ($connection->getDriverName() === 'pgsql') {
            $indexes = DB::select("SELECT indexname FROM pg_indexes WHERE tablename = ? AND indexname = ?", [$table, $indexName]);
            return count($indexes) > 0;
        }
        
        return false;
    }
};